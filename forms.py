from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, DateField, TextAreaField
from wtforms.fields.choices import SelectField
from wtforms.validators import DataRequired


# Form class for creating a new task
class CreateTaskForm(FlaskForm):
    # Task title (required)
    title = StringField("Task", validators=[DataRequired()])

    # Rich text description using TextAreaField (required)
    description = TextAreaField("Detailed description", validators=[DataRequired()])

    # Deadline for completing the task (required)
    complete_time = DateField("Complete Time", validators=[DataRequired()])

    # Dropdown for task priority (required)
    priority = SelectField(
        "Priority",
        validators=[DataRequired()],
        choices=[("High", "High"), ("Medium", "Medium"), ("Low", "Low")]
    )

    # Optional subtasks, one per line
    subtasks = TextAreaField("Subtasks (one per line)")

    # Submit button
    submit = SubmitField("Add Task")
