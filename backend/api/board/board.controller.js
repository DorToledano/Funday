const boardService = require('./board.service')

const logger = require('../../services/logger.service')

async function getBoardList(req, res) {
  try {
    logger.debug('Getting boardList')
    const filterBy = {
      txt: req.query.txt || '',
      userId: req.query.userId || ''
    }
    const boardList = await boardService.query(filterBy)
    res.json(boardList)
  } catch (err) {
    logger.error('Failed to get boardList', err)
    res.status(500).send({ err: 'Failed to get boardList' })
  }
}

async function getBoardById(req, res) {
  try {
    const boardId = req.params.id
    const board = await boardService.getById(boardId)
    res.json(board)
  } catch (err) {
    logger.error('Failed to get board', err)
    res.status(500).send({ err: 'Failed to get board' })
  }
}

async function addBoard(req, res) {
  try {
    const board = req.body
    const addedBoard = await boardService.add(board)
    res.json(addedBoard)
  } catch (err) {
    logger.error('Failed to add board', err)
    res.status(500).send({ err: 'Failed to add board' })
  }
}

async function addGptBoard(req, res) {
  try {
    const boardObj = req.body
    const addedBoard = await boardService.gpt(boardObj)
    res.json(addedBoard)
  } catch (err) {
    logger.error('Failed to add board', err)
    res.status(500).send({ err: 'Failed to add board' })
  }
}


async function updateBoard(req, res) {
  try {
    const board = req.body
    const updatedBoard = await boardService.update(board)
    res.json(updatedBoard)
  } catch (err) {
    logger.error('Failed to update board', err)
    res.status(500).send({ err: 'Failed to update board' })

  }
}

async function applyDrag(req, res) {
  try {
    const ids = req.body
    await boardService.applyDrag(ids)
    res.json(true)
  } catch (err) {
    logger.error('Failed to update board', err)
    res.status(500).send({ err: 'Failed to update board' })

  }
}

async function removeBoard(req, res) {
  try {
    const boardId = req.params.id
    const removedId = await boardService.remove(boardId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove board', err)
    res.status(500).send({ err: 'Failed to remove board' })
  }
}

async function addBoardMsg(req, res) {
  const { loggedinUser } = req
  try {
    const boardId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser
    }
    const savedMsg = await boardService.addBoardMsg(boardId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update board', err)
    res.status(500).send({ err: 'Failed to update board' })

  }
}

async function removeBoardMsg(req, res) {
  const { loggedinUser } = req
  try {
    const boardId = req.params.id
    const { msgId } = req.params

    const removedId = await boardService.removeBoardMsg(boardId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove board msg', err)
    res.status(500).send({ err: 'Failed to remove board msg' })

  }
}

module.exports = {
  getBoardList,
  getBoardById,
  addBoard,
  updateBoard,
  removeBoard,
  addBoardMsg,
  removeBoardMsg,
  applyDrag,
  addGptBoard
}
