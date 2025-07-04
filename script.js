
        let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];
        let currentColumn = '';

        // Initialize the board
        document.addEventListener('DOMContentLoaded', function() {
            loadTasks();
            setupEventListeners();
        });

        function setupEventListeners() {
            // Form submission
            document.getElementById('taskForm').addEventListener('submit', function(e) {
                e.preventDefault();
                addTask();
            });

            // Modal close on outside click
            document.getElementById('taskModal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });

            // Setup drag and drop for columns
            const columns = document.querySelectorAll('.column');
            columns.forEach(column => {
                column.addEventListener('dragover', handleDragOver);
                column.addEventListener('drop', handleDrop);
                column.addEventListener('dragenter', handleDragEnter);
                column.addEventListener('dragleave', handleDragLeave);
            });
        }

        function openModal(column) {
            currentColumn = column;
            document.getElementById('taskModal').style.display = 'block';
            document.getElementById('taskTitle').focus();
        }

        function closeModal() {
            document.getElementById('taskModal').style.display = 'none';
            document.getElementById('taskForm').reset();
            currentColumn = '';
        }

        function addTask() {
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const priority = document.getElementById('taskPriority').value;

            if (!title.trim()) return;

            const task = {
                id: Date.now().toString(),
                title: title.trim(),
                description: description.trim(),
                priority: priority,
                column: currentColumn,
                createdAt: new Date().toLocaleDateString()
            };

            tasks.push(task);
            saveTasks();
            renderTask(task);
            updateTaskCounts();
            closeModal();
        }

        function deleteTask(taskId) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                loadTasks();
            }
        }

        function renderTask(task) {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.draggable = true;
            taskElement.dataset.taskId = task.id;

            taskElement.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    <span class="task-date">${task.createdAt}</span>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
                </div>
            `;

            // Add drag event listeners
            taskElement.addEventListener('dragstart', handleDragStart);
            taskElement.addEventListener('dragend', handleDragEnd);

            // Add to appropriate column
            const column = document.querySelector(`[data-column="${task.column}"] .task-list`);
            column.appendChild(taskElement);
        }

        function loadTasks() {
            // Clear all task lists
            document.querySelectorAll('.task-list').forEach(list => {
                list.innerHTML = '';
            });

            // Render all tasks
            tasks.forEach(task => {
                renderTask(task);
            });

            updateTaskCounts();
        }

        function updateTaskCounts() {
            const columns = ['todo', 'inprogress', 'done'];
            columns.forEach(column => {
                const count = tasks.filter(task => task.column === column).length;
                document.querySelector(`[data-column="${column}"] .task-count`).textContent = count;
            });
        }

        function saveTasks() {
            localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
        }

        // Drag and Drop functionality
        let draggedTask = null;

        function handleDragStart(e) {
            draggedTask = this;
            this.classList.add('dragging');
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            draggedTask = null;
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDragEnter(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            this.classList.remove('drag-over');
        }

        function handleDrop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            if (draggedTask) {
                const newColumn = this.dataset.column;
                const taskId = draggedTask.dataset.taskId;

                // Update task in data
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].column = newColumn;
                    saveTasks();
                    loadTasks();
                }
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });