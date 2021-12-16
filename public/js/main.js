/*
Các chức năng có trong ứng dụng todolist
1. Lấy danh sách cv hiện có (done)
2. Thêm cv (done)
3. Sửa cv
4. Xóa cv (done)
5. Lọc cv theo trạng thái
6. Thay đổi trạng thái
*/

// Truy cập vào các thành phần
const todo_list = document.querySelector(".todo-list");
const todo_input = document.getElementById("todo-input");
const btn_add = document.getElementById("btn-add");
const todo_option_item = document.querySelectorAll(".todo-option-item input");

// Khai báo biến
let todos = [];
let isUpdate = false;
let idUpdate = null;

// Random id
function createId() {
    return Math.floor(Math.random() * 100000);
}

// ============== API ===============
// API lấy danh sách todo
function getTodosAPI(status) {
    switch (status) {
        case "all": {
            return axios.get("/todos");
        }
        case "active": {
            return axios.get("/todos?status=true");
        }
        case "unactive": {
            return axios.get("/todos?status=false");
        }
        default: {
            return axios.get("/todos");
        }
    }
}

// API thêm công việc
function createTodoAPI(title) {
    return axios.post("/todos", {
        id: createId(),
        title: title,
        status: false,
    });
}

// API xóa công việc
function deleteTodoAPI(id) {
    return axios({
        method : "delete",
        url : `/todos/${id}`
    })
}

// API cập nhật công việc
function updateTodoAPI(todo) {
    return axios({
        method: "put",
        url: `/todos/${todo.id}`,
        data: todo,
    });
}


// Render UI - Hiển thị danh sách todo ra ngoài giao diện
function renderUI(arr) {
    todo_list.innerHTML = "";

    // Kiểm tra mảng rỗng
    if (arr.length == 0) {
        todo_list.innerHTML = "Không có công việc nào trong danh sách";
        return;
    }

    // Trường hợp có công việc
    for (let i = 0; i < arr.length; i++) {
        const t = arr[i];
        todo_list.innerHTML += `
            <div class="todo-item ${t.status ? "active-todo" : ""}">
                <div class="todo-item-title">
                    <input 
                        type="checkbox" 
                        ${t.status ? "checked" : ""}
                        onclick="toggleStatus(${t.id})"
                    />
                    <p>${t.title}</p>
                </div>
                <div class="option">
                    <button class="btn btn-update" onclick="updateTitle(${t.id})">
                        <img src="./img/pencil.svg" alt="icon" />
                    </button>
                    <button class="btn btn-delete" onclick=deleteTodo(${t.id})>
                        <img src="./img/remove.svg" alt="icon" />
                    </button>
                </div>
            </div>
        `;
    }
}

// ============= Hàm xử lý =============
// Lấy danh sách todo
async function getTodos(status) {
    try {
        const res = await getTodosAPI(status);
        todos = res.data;

        // Render ra ngoài giao diện
        renderUI(todos);
    } catch (error) {
        console.log(error);
    }
}

// Hàm xử lý việc thêm
async function createTodo(title) {
    try {
        const res = await createTodoAPI(title);
        todos.push(res.data)

        // Render ra ngoài giao diện
        renderUI(todos);
    } catch (error) {
        console.log(error);
    }
}

// Hàm xử lý việc xóa
async function deleteTodo(id) {
    try {
        await deleteTodoAPI(id) // Gọi API xóa

        // Xóa todo trong mảng todos ban đầu
        todos.forEach((todo, index) => {
            if(todo.id == id) {
                todos.splice(index, 1)
            }
        })

        renderUI(todos)

    } catch (error) {
        console.log(error);
    }
}

// Hàm xử lý thay đổi trạng thái công việc
async function toggleStatus(id) {
    try {
        let todo = todos.find((todo) => todo.id == id);
        todo.status = !todo.status;

        let res = await updateTodoAPI(todo);

        todos.forEach((todo, index) => {
            if (todo.id == id) {
                todos[index] = res.data;
            }
        });
        renderUI(todos);
    } catch (error) {
        console.log(error);
    }
}

// Hàm xử lý thay đổi tiêu đề công việc
async function updateTodo(todoUpdate) {
    try {
        let res = await updateTodoAPI(todoUpdate);

        todos.forEach((todo, index) => {
            if (todo.id == todoUpdate.id) {
                todos[index] = res.data;
            }
        });

        btn_add.innerText = "Thêm";
        isUpdate = false;
        idUpdate = null;

        renderUI(todos);
    } catch (error) {
        console.log(error);
    }
}

// Lấy giá trị trong 1 ô input radio
function getOptionSelected() {
    for (let i = 0; i < todo_option_item.length; i++) {
        if (todo_option_item[i].checked) {
            return todo_option_item[i].value;
        }
    }
}

todo_option_item.forEach((btn) => {
    btn.addEventListener("change", function () {
        let optionSelected = getOptionSelected();
        getTodos(optionSelected);
    });
});

// Thêm công việc và cập nhật tiêu đề công việc
btn_add.addEventListener("click", function () {
    let todoTitle = todo_input.value;
    if (todoTitle == "") {
        alert("Nội dung không được để trống!");
        return;
    }
    if (isUpdate) {
        let todo = todos.find((todo) => todo.id == idUpdate);
        todo.title = todoTitle;

        updateTodo(todo);
    } else {
        createTodo(todoTitle);
    }

    todo_input.value = "";
});

// Cập nhật tiêu đề todo
function updateTitle(id) {
    let title;
    todos.forEach((todo) => {
        if (todo.id == id) {
            title = todo.title;
        }
    });

    btn_add.innerText = "CẬP NHẬT";

    todo_input.value = title;
    todo_input.focus();

    idUpdate = id;
    isUpdate = true;
}

window.onload = () => {
    getTodos();
};