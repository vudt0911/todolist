/*
todolist
    // 1. lấy danh sách hiện có 
    // 2. thêm công sách
    // 3. sửa
    // 4. xoá
    // 5. lọc công việc theo trạng thái
    // 6. thay đổi trạng thái   
*/

// ============Truy cap vao cac thanh phan===========================
const todo_list = document.querySelector('.todo-list');

const todo_input = document.getElementById('todo-input');
const todo_add = document.getElementById('btn-add');
const todo_delete = document.querySelector('.btn-delete');
const input_checkbox = document.querySelector('.todo-item-title input');
const edit_div = document.querySelector('.edit-div');
const add_div =document.querySelector('.add-div');
const btn_edit = document.getElementById('btn-edit');
const edit_input =document.getElementById('edit-input');
const radio_all = document.getElementById('all');
const radio_active = document.getElementById('active');
const radio_unactive = document.getElementById('unactive');

// ========Khai bao bien================
let todos = [];

function autoID(){
    const id = Math.floor(Math.random() * 10000);
    return id;
}

// ========API================================

// API lay danh sach todo
function getTodosAPI() {
    return axios.get('/todos');
}

// API tao danh sach
function createTodosAPI(title) {
    return axios.post('/todos', {
        id: autoID(),
        title: title,
        status: false,
      })
}

// API xoa todo
function deleteTodoAPI(id){
    return axios.delete(`/todos/${id}`);
}

// API editTitle todo
function updateTodoAPI(title, id){
    return axios.PATCH(`/todos/${id}`, {title:title});
}

// API edit status
function editStatusAPI(id, status){
    return axios.PATCH(`/status/${id}`, {status:status})
}

// =========render UI, hien thi danh sach ra ngoai giao dien================================
function renderUI(arr) {
    todo_list.innerHTML = "";

    if(arr.length == 0){
        todo_list.innerHTML = "khong co cong viec nao trong danh sach";
        return;
    }

    for(let i = 0; i < arr.length; i++){
        let item = arr[i];
        
        todo_list.innerHTML += `
        <div class="todo-item ${item.status ? 'active-todo' : ''}">
            <div class="todo-item-title">
                <input type="checkbox" ${item.status ? 'checked' : ''} onchange = editStatusClick(${item.id}) />
                <p>${item.title}</p>
            </div>
            <div class="option">
                <button class="btn btn-update" onclick = editTodo(${item.id})>
                    <img src="./public/img/pencil.svg" alt="icon" />
                </button>
                <button class="btn btn-delete" onclick = deleteTodo(${item.id})>
                    <img src="./public/img/remove.svg" alt="icon" />
                </button>
            </div>
        </div>
        `;
    }
}

// ========Ham xu ly================

// lay danh sach todos
async function getTodos(){
    try {
        const response = await getTodosAPI();
        todos = response.data;

        //render ra ngoai giao dien
        renderUI(todos);
    } catch (error) {
        // alert(error.message);
        console.log(error);
    }
}

// them cong viec
async function createTodo(title){
    try {
        const res = await createTodosAPI(title);
        todos.push(res.data);

        renderUI(todos);
    } catch (error) {
        console.log(error);
    }
}

todo_add.addEventListener('click', function() {
    const todoTile = todo_input.value;
    
    if(todoTile == ''){
        alert('hay nhap cong viec can them');
        return;
    }

    createTodo(todoTile);
    todoTitle = '';
})

// xoa cong viec
async function deleteTodo(id){
    try {
        const res = await deleteTodoAPI(id);
        todos.forEach((todo, index) => {
            if(todo.id == id){
                todo.splice(index, 1);
            }
        })

        renderUI(todos);
    } catch (error) {
        console.log(error);
    }
}

// edit Title
async function updateTodo(title, id) {
    try {
        const res = await updateTodoAPI(title, id);
        editTodo(id);
    } catch (error) {
        console.log(error);
    }
}

function editTodo(id){
    const todoEl = todos.find(todo => todo.id === id);
    add_div.classList.add('hidden');
    edit_div.classList.remove('hidden');

    const titleEl = todoEl.title;
    edit_input.value = titleEl;
    btn_edit.addEventListener('click', () => {
        todoEl.title = edit_input.value;
        renderUI(todos);
    })
}

// edit status 
async function editStatus(id, status){
    try {
        await editStatusAPI(id, status);
        todos.forEach((todo) => {
            if(todo.id == id){
                todo.status = status;
            }
        })
    } catch (error) {
        console.log(error);
    }
}

function editStatusClick(id){
    const todoEl = todos.find(todo => todo.id === id);
    const statusnew = todoEl.status;
    todoEl.status = !statusnew;
    if(radio_active.checked === true){
        activeTodo();
    }else if(radio_unactive.checked === true){
        unactiveTodo();
    }else if(radio_all.checked === true){
        renderUI(todos);
    }
}

// filter todo follow status
function activeTodo(){
    const activeEl = todos.filter(todo => todo.status === true);
    renderUI(activeEl);
}

function unactiveTodo(callback){
    const unactiveEl = todos.filter(todo => todo.status === false);
    renderUI(unactiveEl);
    unactiveTodo;
}

function allTodo(){
    renderUI(todos);
}

// load du lieu
window.onload = () => {
    getTodos();
}