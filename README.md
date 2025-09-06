# Flask To-Do App

A modern, feature-rich to-do list application built with **Flask**, **WTForms**, and **Bootstrap**.  
Easily manage tasks, subtasks, deadlines, and priorities with a clean, responsive interface.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-2.0+-black.svg)
![License](https://img.shields.io/badge/license-Non--Commercial-red.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

---

## Table of Contents

* [Features](#features)
* [Screenshots](#screenshots)
* [Installation](#installation)
* [Usage](#usage)
* [Technical Details](#technical-details)
* [File Structure](#file-structure)
* [Contributing](#contributing)
* [Roadmap](#roadmap)
* [System Requirements](#system-requirements)
* [Troubleshooting](#troubleshooting)
* [License](#license)
* [Author](#author)
* [Acknowledgments](#acknowledgments)
* [Support](#support)

---

## Features

### ✅ Core Functionality
* Add, view, edit, and delete tasks
* Organize tasks with due dates and priorities
* Track completion status in real-time
* Create and manage subtasks under each main task

### 📝 Task Details
* Priority labels: High, Medium, Low
* Task metadata: Created date, due date, and status
* Subtask checkboxes with instant updates

### 🎨 Modern UI/UX
* Responsive **Bootstrap-based** layout
* Sidebar for task list, detail panel for task info
* Color-coded priority highlights
* Clean hover and active item states

### 🔧 Extra Functionality
* Quick edit form for updating tasks inline
* AJAX-based updates (no page reloads)
* Scrollable task list and descriptions

---

## Demo video

https://github.com/user-attachments/assets/3f0cdb91-0e91-44b7-acd1-3e61dd243eb1


---

## Installation

### Prerequisites
* Python 3.8 or higher
* pip package manager
* Virtual environment recommended

### Steps

```bash
git clone https://github.com/vidhun05/flask-todo.git
cd flask-todo
pip install -r requirements.txt
flask run
````

---

## Usage

1. Start the Flask server (`flask run`)
2. Open your browser at `http://127.0.0.1:5000`
3. Add a new task using the form
4. Click on a task in the sidebar to view details
5. Mark tasks as complete or delete them when done
6. Edit tasks directly from the detail panel

---

## Technical Details

### Built With

* **Flask** - Web framework
* **WTForms + Flask-WTF** - Form handling & validation
* **Bootstrap 5** - Frontend styling
* **JavaScript (fetch API)** - AJAX requests

### Architecture

* **Model-View-Controller style** organization
* Forms handled via WTForms classes
* Backend endpoints return JSON for AJAX updates
* Templates extend a base layout with Jinja2

### Key Components

* `CreateTaskForm` - Handles task creation
* `routes.py` - Flask routes for CRUD operations
* `todo.js` - Manages detail panel, edits, and updates
* `styles.css` - Custom sidebar and task styling

---

## File Structure

```
flask-todo/
├── app.py                 # Main Flask application
├── forms.py               # WTForms definitions
├── static/
│   ├── css/style.css      # Custom styles
|   ├── images/favicon.ico # favicon
│   └── js/script.js       # Frontend JS logic
├── templates/
│   └── index.html         # Main page
├── requirements.txt       # Dependencies
└── README.md              # Project documentation
```

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

* Drag & drop task reordering
* Dark mode theme
* Export tasks as PDF/CSV
* Calendar integration

---

## Roadmap

* [ ] User authentication
* [ ] Search and filter tasks
* [ ] Recurring tasks
* [ ] Notifications & reminders
* [ ] Multi-language support

---

## Troubleshooting

### Task not saving

* Ensure all required fields (title, description, due date, priority) are filled


### Subtask updates not working

* Ensure JavaScript is enabled in your browser
* Check Flask server logs for errors

---

## License

This project is licensed under a **custom Non-Commercial License based on the MIT License**.

You are free to:

* Use the software for personal or educational purposes
* Modify and improve the code
* Contribute via pull requests

You are **not allowed** to:

* Sell or use this software for commercial purposes
* Distribute modified versions for profit

See the [LICENSE](LICENSE) file for full terms.

---

## Author

**Vidhun Roshan** - *Initial work*

---

## Acknowledgments

* Flask community for extensive support
* Bootstrap team for responsive frontend utilities
---

## Support

If you encounter any problems or have questions, please:

1. Check the [Issues](https://github.com/vidhun05/flask-todo/issues) page
2. Create a new issue if your problem isn't listed
3. Provide details about your environment and the issue

---

⭐ **If you found this project helpful, give it a star!** ⭐

```
