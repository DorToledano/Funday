
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'

const STORAGE_KEY = 'task'

export const boardService = {
    query,
    getById,
    save,
    remove,
    getEmptyTask,
    addTaskMsg
}
window.cs = boardService


async function query(filterBy = { txt: '', price: 0 }) {
    var tasks = await storageService.query(STORAGE_KEY)
    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        tasks = tasks.filter(task => regex.test(task.vendor) || regex.test(task.description))
    }
    if (filterBy.price) {
        tasks = tasks.filter(task => task.price <= filterBy.price)
    }
    return tasks
}

function getById(taskId) {
    return storageService.get(STORAGE_KEY, taskId)
}

async function remove(taskId) {
    await storageService.remove(STORAGE_KEY, taskId)
}

async function save(task) {
    var savedTask
    if (task._id) {
        savedTask = await storageService.put(STORAGE_KEY, task)
    } else {
        // Later, owner is set by the backend
        task.owner = userService.getLoggedinUser()
        savedTask = await storageService.post(STORAGE_KEY, task)
    }
    return savedTask
}

async function addTaskMsg(taskId, txt) {
    // Later, this is all done by the backend
    const task = await getById(taskId)
    if (!task.msgs) task.msgs = []

    const msg = {
        id: utilService.makeId(),
        by: userService.getLoggedinUser(),
        txt
    }
    task.msgs.push(msg)
    await storageService.put(STORAGE_KEY, task)

    return msg
}

function getEmptyTask() {
    return {
        vendor: 'Susita-' + (Date.now() % 1000),
        price: utilService.getRandomIntInclusive(1000, 9000),
    }
}


// TEST DATA
// ;(async ()=>{
//     await storageService.post(STORAGE_KEY, {vendor: 'Subali Karov 1', price: 180})
//     await storageService.post(STORAGE_KEY, {vendor: 'Subali Rahok 2', price: 240})
// })()