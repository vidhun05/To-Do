import os
from datetime import datetime
from flask import Flask, abort, render_template, redirect, url_for, request, jsonify
from flask_bootstrap import Bootstrap5
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, Boolean, DateTime, JSON, select
from sqlalchemy.orm.attributes import flag_modified
from forms import CreateTaskForm

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'randomkeyforsecret'  # Required for form validation/CSRF
Bootstrap5(app)  # Using Bootstrap for styling

# SQLAlchemy setup
class Base(DeclarativeBase):
    pass

# Database URI (default: SQLite if DB_URI not set in environment)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DB_URI", "sqlite:///todos.db")
db = SQLAlchemy(model_class=Base)
db.init_app(app)


# Database model for tasks
class Task(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(250))
    description: Mapped[str] = mapped_column(Text)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    complete_time: Mapped[datetime] = mapped_column(DateTime)  # due date
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    priority: Mapped[str] = mapped_column(String(250))  # high / medium / low
    subtasks: Mapped[list] = mapped_column(MutableList.as_mutable(JSON), default=[])


# Create tables (if not exists)
with app.app_context():
    db.create_all()


# Home route: show tasks + handle new task creation
@app.route('/', methods=['GET', 'POST'])
def index():
    sort_param = request.args.get('sort', 'default')
    completed_param = request.args.get("completed", "0") == "1"

    # Get tasks filtered by completion status
    tasks = db.session.scalars(
        select(Task).where(Task.completed == completed_param)
    ).all()

    # Sorting options (priority, due_date, creation time, alphabetical)
    if sort_param == 'priority':
        priority_order = {'high': 1, 'medium': 2, 'low': 3}
        tasks.sort(key=lambda t: (priority_order.get(t.priority.lower(), 2), -t.created_at.timestamp()))
    elif sort_param == 'due_date':
        tasks.sort(key=lambda t: (t.complete_time or datetime.max, t.priority))
    elif sort_param == 'created_desc':
        tasks.sort(key=lambda t: t.created_at, reverse=True)
    elif sort_param == 'created_asc':
        tasks.sort(key=lambda t: t.created_at)
    elif sort_param == 'alphabetical':
        tasks.sort(key=lambda t: t.title.lower())
    else:  # default fallback
        priority_order = {'high': 1, 'medium': 2, 'low': 3}
        tasks.sort(key=lambda t: (priority_order.get(t.priority.lower(), 2), -t.created_at.timestamp()))

    # Handle new task form
    form = CreateTaskForm()
    if form.validate_on_submit():
        # Split subtasks into list
        subtasks_list = [
            {"text": line.strip(), "completed": False}
            for line in form.subtasks.data.splitlines() if line.strip()
        ]

        new_task = Task(
            title=form.title.data,
            description=form.description.data,
            complete_time=form.complete_time.data,
            priority=form.priority.data,
            subtasks=subtasks_list,
        )
        db.session.add(new_task)
        db.session.commit()
        return redirect(url_for("index"))

    return render_template('index.html', tasks=tasks, form=form, show_completed=completed_param)


# Fetch task details (for modal or AJAX)
@app.route("/details", methods=["POST"])
def send_details():
    data = request.get_json()
    todoid = data["todoid"]
    task = Task.query.get_or_404(todoid)

    task_dict = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "complete_time": task.complete_time.strftime("%d %B %Y") if task.complete_time else None,
        "created_at": task.created_at.strftime("%d %B %Y") if task.created_at else None,
        "priority": task.priority,
        "subtasks": task.subtasks,
    }
    return jsonify(task_dict)


# Delete a task
@app.route("/delete", methods=["POST"])
def delete_task():
    data = request.get_json()
    todoid = data.get("todoid")

    task = Task.query.get_or_404(todoid)
    db.session.delete(task)
    db.session.commit()

    return jsonify({"success": True})


# Mark task as completed
@app.route("/complete", methods=["POST"])
def complete_task():
    data = request.get_json()
    task = Task.query.get_or_404(data["todoid"])
    task.completed = True
    db.session.commit()
    return jsonify({"success": True})


# Update an existing task (title, description, priority, subtasks, due date)
@app.route('/update-task', methods=["POST"])
def update_task():
    data = request.get_json()
    todo_id = data.get('todo_id')
    task = Task.query.get_or_404(todo_id)

    # Update fields if provided
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.priority = data.get('priority', task.priority)

    # Handle subtasks (JSON field)
    if 'subtasks' in data and isinstance(data['subtasks'], list):
        task.subtasks = data['subtasks']
        flag_modified(task, "subtasks")  # Mark JSON as changed

    # Handle due date parsing
    due_date_str = data.get('due_date')
    if due_date_str:
        try:
            task.complete_time = datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            pass  # Ignore invalid date

    db.session.commit()
    return jsonify({'success': True})


# Update a specific subtask (mark completed/uncompleted)
@app.route("/update-subtask", methods=["POST"])
def update_subtask():
    data = request.get_json()
    task = Task.query.get_or_404(data["todoid"])
    index = data["subtask_index"]

    if 0 <= index < len(task.subtasks):
        task.subtasks[index]["completed"] = data["completed"]
        flag_modified(task, "subtasks")  # Required to persist JSON changes
        db.session.commit()
        db.session.refresh(task)  # Reload from DB
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Invalid subtask index"}), 400


# Run the app
if __name__ == '__main__':
    app.run(debug=True)
