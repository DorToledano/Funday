import { boardService } from '../services/board.service'

export const boardStore = {
  state: {
    board: {},
    boardList: [],
  },
  getters: {
    board({ board }) {
      return board
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
    },
    addBoard(state, { board }) {
      state.board = board
      const minBoard = { _id: board._id, title: board.title }
      state.boardList.push(minBoard)
    },
    deleteBoard(state, { boardId }) {
      const idx = state.boardList.findIndex((board) => board._id === boardId)
      // // console.log('idx',idx)
      state.boardList = state.boardList.filter((board) => board._id !== boardId)
      if (idx > -1 && state.boardList.length === 1)
        state.board = state.boardList[idx - 1]
    },
    filterBoard(state, { txt }) {
      const filteredBoard = boardService.filterByTxt(state.board, txt)
      return filteredBoard
    },
    // setTasks(state, { tasks }) {
    //     state.tasks = tasks
    // },
    // addTask(state, { task }) {
    //     state.tasks.push(task)
    // },
    // saveTask(state, { task }) {
    //     const idx = state.tasks.findIndex(c => c._id === task._id)
    //     state.tasks.splice(idx, 1, task)
    // },
    // removeTask(state, { taskId }) {
    //     state.tasks = state.tasks.filter(task => task._id !== taskId)
    // },
    // addTaskMsg(state, { taskId, msg }) {
    //     const task = state.tasks.find(task => task._id === taskId)
    //     if (!task.msgs) task.msgs = []
    //     task.msgs.push(msg)
    // },
    // setGroups(state, { groups }) {
    //     state.groups = groups
    // },
    // addGroup(state, { group }) {
    //     state.groups.push(group)
    // },
    // updateGroup(state, { group }) {
    //     const idx = state.groups.findIndex(c => c._id === group._id)
    //     state.groups.splice(idx, 1, group)
    // },
    removeGroup(state, { groupId }) {
      const groupIdx = state.board.groups.findIndex(
        (group) => group.id === groupId
      )
      state.board.groups.splice(groupIdx, 1)
    },
    // addGroupMsg(state, { groupId, msg }) {
    //     const group = state.groups.find(group => group._id === groupId)
    //     if (!group.msgs) group.msgs = []
    //     group.msgs.push(msg)
    // },
  },
  actions: {
    async saveTask(context, { payload }) {
      try {
        const { boardId, task, groupId } = payload
        const updatedBoard = await boardService.save(
          boardId,
          'task',
          task,
          groupId
        )
        context.commit({ type: 'setBoard', board: updatedBoard })
        return task
      } catch (err) {
        // // console.log('Store: Error in updateTask', err)
        throw err
      }
    },
    async addTask({ dispatch, getters }) {
      const task = boardService.getEmptyTask()
      const board = getters.board
      const boardId = board._id
      const groupId = board.groups[0].id
      const payload = { boardId, task, groupId }
      return dispatch({ type: 'saveTask', payload })
    },
    async removeTask(context, { ids }) {
      try {
        const updatedBoard = await boardService.remove(ids, 'task')
        context.commit({ type: 'setBoard', board: updatedBoard })
      } catch (err) {
        console.log('Store: Error in removeTask', err)
        throw err
      }
    },
    async addGroup({ dispatch, getters, commit }) {
      const group = boardService.getEmptyGroup()
      const board = getters.board
      const boardId = board._id
      const updatedBoard = await boardService.save(boardId, 'group', group)
      commit({ type: 'setBoard', board: updatedBoard })
    },
    async removeGroup(context, { payload }) {
      try {
        const { groupId, boardId } = payload
        await boardService.remove({ boardId, groupId }, 'group')
        context.commit({ type: 'removeGroup', groupId })
        return groupId
      } catch (err) {
        console.log('boardStore: Error in deleteBoard', err)
        throw err
      }
    },
    async saveGroup(context, { payload }) {
      try {
        const { boardId, group, groupId } = payload
        const updatedBoard = await boardService.save(
          boardId,
          'group',
          group,
          groupId
        )
        context.commit({ type: 'setBoard', board: updatedBoard })
        return group
      } catch (err) {
        console.log('Store: Error in saveGroup', err)
        throw err
      }
    },
    async getBoardById(context, { boardId }) {
      try {
        const board = await boardService.getById(boardId)
        context.commit({ type: 'setBoard', board })
        return board
      } catch (err) {
        console.log('Store: Error in getBoardById', err)
      }
    },
    async getFirstBoard({ dispatch, state }) {
      const boardId = state.boardList[0]._id
      dispatch({ type: 'getBoardById', boardId })
      return boardId
    },
    async loadBoardList(context, { filterBy }) {
      try {
        const boardList = await boardService.queryList(filterBy)
        console.log('boardList', boardList)
        context.commit({ type: 'setBoardList', boardList })
        return boardList
      } catch (err) {
        console.log('Store: Error in loadBoardList', err)
        throw err
      }
    },
    async addBoard({ commit }) {
      try {
        const board = await boardService.getEmptyBoard()
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
        const boardListCopy = JSON.parse(
          JSON.stringify(context.state.boardList)
        )
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
    async applyTaskDrag(context, { payload }) {
      try {
        const { addedId, removedId, boardId, groupId } = payload
        const updatedBoard = await boardService.applyDrag(
          addedId,
          removedId,
          'task',
          boardId,
          groupId
        )
        context.commit({ type: 'setBoard', board: updatedBoard })
        return true
      } catch (err) {
        console.log('Store: Error in apply task drag', err)
        throw err
      }
    },
    async applyGroupDrag(context, { payload }) {
      try {
        const { addedId, removedId, boardId } = payload
        const updatedBoard = await boardService.applyDrag(
          addedId,
          removedId,
          'group',
          boardId
        )
        context.commit({ type: 'setBoard', board: updatedBoard })
        return true
      } catch (err) {
        console.log('Store: Error in apply group drag', err)
        throw err
      }
    },
    async applyBoardDrag(context, { payload }) {
      try {
        const { addedId, removedId } = payload
        const boardList = await boardService.applyDrag(
          addedId,
          removedId,
          'board'
        )
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
