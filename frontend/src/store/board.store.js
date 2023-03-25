import { boardService } from '../services/board.service'
import { router } from '../router'
import { toRefs } from 'vue'

export const boardStore = {
	state: {
		board: {},
		filteredBoard: {},
		boardList: [],
		filterBy: {
			txt: '',
		},
	},
	getters: {
		board({ board }) {
			return board
		},
		filteredBoard({ filteredBoard }) {
			return filteredBoard
		},
		boardList({ boardList }) {
			return boardList
		},
	},
	mutations: {
		setBoardList(state, { boardList }) {
			state.boardList = boardList
		},
		setBoard(state, { board }) {
			state.board = board
			router.push(`/board/${board._id}/main-table`)
		},
		addBoard(state, { board }) {
			const minBoard = { _id: board._id, title: board.title }
			state.boardList = [...state.boardList, minBoard]
			state.board = board
			state.filteredBoard = JSON.parse(JSON.stringify(state.board))
		},
		deleteBoard(state, { boardId }) {
			const idx = state.boardList.findIndex((board) => board._id === boardId)
			state.boardList = state.boardList.filter((board) => board._id !== boardId)
			if (idx > -1 && state.boardList.length === 1) state.board = state.boardList[idx - 1]
			state.filteredBoard = JSON.parse(JSON.stringify(state.board))
		},
		filterBoard(state, { filterBy }) {
			let filter = (!filterBy) ? state.filterBy : filterBy
			state.filterBy = filter
			const boardCopy = JSON.parse(JSON.stringify(state.board))
			const txt = filterBy.txt
			if (txt === '') {
				state.filteredBoard = boardCopy
				return
			}
			const filterBoard = boardService.filterByTxt(boardCopy, txt)
			state.filteredBoard = filterBoard
		},
		// saveTask({ board }, { payload }) {
		// 	const { task, groupId } = payload
		// 	const groupIdx = board.groups.findIndex(group => group.id === groupId)
		// 	const taskIdx = board.groups[groupIdx].tasks.findIndex(task => task.id === task.id)
		// 	if (taskIdx > -1) {
		// 		board.groups[groupIdx].tasks.splice(taskIdx, 1, task)
		// 	} else {
		// 		board.groups[groupIdx].tasks.push(task)
		// 	}
		// },
		// removeTask({ state }, { ids }) {
		// 	const { groupId, taskId } = ids
		// 	const groupIdx = board.groups.findIndex(group => group.id === groupId)
		// 	state.board.groups[groupIdx].tasks.filter(task => task._id !== taskId)
		// },
		// saveGroup(state, { groups }) {
		// 	state.groups = groups
		// },
		// addGroup(state, { group }) {
		//     state.groups.push(group)
		// },
		// updateGroup(state, { group }) {
		//     const idx = state.groups.findIndex(c => c._id === group._id)
		//     state.groups.splice(idx, 1, group)
		// },
		// addGroupMsg(state, { groupId, msg }) {
		//     const group = state.groups.find(group => group._id === groupId)
		//     if (!group.msgs) group.msgs = []
		//     group.msgs.push(msg)
		// },
		removeGroup(state, { groupId }) {
			const groupIdx = state.board.groups.findIndex((group) => group.id === groupId)
			state.board.groups.splice(groupIdx, 1)
		},
	},
	actions: {
		async saveTask({ dispatch }, { payload }) {
			try {
				const { boardId, task, groupId } = payload
				const updatedBoard = await boardService.save(boardId, 'task', task, groupId)
				dispatch({ type: 'setAndFilterBoard', board: updatedBoard })
				return task
			} catch (err) {
				console.log('Store: Error in updateTask', err)
				throw err
			}
		},
		async addTask({ dispatch, getters }, { groupId }) {
			const task = boardService.getEmptyTask()
			const boardId = getters.board._id
			const updatedGroupId = !groupId ? board.groups[0].id : groupId
			const payload = { boardId, task, groupId: updatedGroupId }
			return dispatch({ type: 'saveTask', payload })
		},
		async removeTask({ commit }, { ids }) {
			try {
				await boardService.remove(ids, 'task')
				commit({ type: 'removeTask', ids })
			} catch (err) {
				console.log('Store: Error in removeTask', err)
				throw err
			}
		},
		async addGroup({ dispatch, getters }) {
			const group = boardService.getEmptyGroup()
			const boardId = getters.board._id
			const updatedBoard = await boardService.save(boardId, 'group', group)
			dispatch({ type: 'setAndFilterBoard', board: updatedBoard })
		},
		async removeGroup({ commit }, { payload }) {
			try {
				const { groupId, boardId } = payload
				await boardService.remove({ boardId, groupId }, 'group')
				commit({ type: 'removeGroup', groupId })
				return groupId
			} catch (err) {
				console.log('boardStore: Error in deleteBoard', err)
				throw err
			}
		},
		async saveGroupTitle({ state, dispatch }, { payload }) {
			try {
				const { boardId, title, groupId } = payload
				const group = JSON.parse(JSON.stringify(state.board.groups.find((group) => group.id === groupId)))
				if (!group) throw new Error('No group')
				group.title = title
				const updatedBoard = await boardService.save(boardId, 'group', group, groupId)
				dispatch({ type: 'setAndFilterBoard', board: updatedBoard })
				return group
			} catch (err) {
				console.log('Store: Error in saveGroup', err)
				throw err
			}
		},
		async saveGroup(context, { payload }) {
			try {
				const { boardId, group, groupId } = payload
				const updatedBoard = await boardService.save(boardId, 'group', group, groupId)
				dispatch({ type: 'setAndFilterBoard', board: updatedBoard })
				return group
			} catch (err) {
				console.log('Store: Error in saveGroup', err)
				throw err
			}
		},
		setAndFilterBoard({ commit, state }, { board }) {
			commit({ type: 'setBoard', board })
			const filterBy = state.filterBy
			commit({ type: 'filterBoard', filterBy })
		},
		async getBoardById({ dispatch }, { boardId }) {
			try {
				const board = await boardService.getById(boardId)
				dispatch({ type: 'setAndFilterBoard', board })
				return board
			} catch (err) {
				console.log('Store: Error in getBoardById', err)
			}
		},
		async getFirstBoard({ dispatch, state }, { params }) {
			const boardId = !params ? state.boardList[0]._id : params
			dispatch({ type: 'getBoardById', boardId })
			return boardId
		},
		async loadBoardList(context, { filterBy }) {
			try {
				const boardList = await boardService.queryList(filterBy)
				context.commit({ type: 'setBoardList', boardList })
				return boardList
			} catch (err) {
				console.log('Store: Error in loadBoardList', err)
				throw err
			}
		},
		async addBoard({ commit }) {
			try {
				const board = boardService.getEmptyBoard()
				const newBoard = await boardService.save(null, 'board', board)
				commit({ type: 'addBoard', board: newBoard })
				return newBoard
			} catch {
				console.log('Store: Error in addBoard', err)
				throw err
			}
		},
		async deleteBoard(context, { boardId }) {
			try {
				// console.log('context.state.boardList',[JSON.parse(JSON.stringify(context.state.boardList))])
				const boardListCopy = JSON.parse(JSON.stringify(context.state.boardList))
				if (boardListCopy.length > 1) {
					await boardService.remove({ boardId }, 'board')
					context.commit({ type: 'deleteBoard', boardId })
					context.dispatch({ type: 'loadBoardList' })
				}
			} catch (err) {
				console.log('boardStore: Error in deleteBoard', err)
				throw err
			}
		},
		async updateBoard({ commit, getters, dispatch }, { payload }) {
			const boardId = getters.board._id
			const updatedBoard = await boardService.updateBoard(boardId, payload)
			commit({ type: 'setBoard', board: updatedBoard })
			dispatch({ type: 'loadBoardList' })
		},
		async applyTaskDrag({ dispatch }, { payload }) {
			try {
				const { addedId, removedId, boardId, groupId } = payload
				const updatedBoard = await boardService.applyDrag(addedId, removedId, 'task', boardId, groupId)
				dispatch({ type: 'setAndFilterBoard', board: updatedBoard })
				return true
			} catch (err) {
				console.log('Store: Error in apply task drag', err)
				throw err
			}
		},
		async applyGroupDrag({ dispatch }, { payload }) {
			try {
				const { addedId, removedId, boardId } = payload
				const updatedBoard = await boardService.applyDrag(addedId, removedId, 'group', boardId)
				dispatch({ type: 'setAndFilterBoard', board: updatedBoard })
				return true
			} catch (err) {
				console.log('Store: Error in apply group drag', err)
				throw err
			}
		},
		async applyBoardDrag(context, { payload }) {
			try {
				const { addedId, removedId } = payload
				const boardList = await boardService.applyDrag(addedId, removedId, 'board')
				context.commit({ type: 'setBoardList', boardList })
				return true
			} catch (err) {
				console.log('Store: Error in apply board drag', err)
				throw err
			}
		},
		// async addGroupMsg(context, { groupId, txt }) {
		//     try {
		//         const msg = await boardService.addGroupMsg(groupId, txt)
		//         context.commit({ type: 'addGroupMsg', groupId, msg })
		//     } catch (err) {
		// // //         console.log('groupStore: Error in addGroupMsg', err)
		//         throw err
		//     }
		// },
	},
}
