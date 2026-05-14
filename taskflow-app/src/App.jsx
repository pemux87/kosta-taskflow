import { useState } from 'react'
import './App.css'

const STATUS = {
  TODO: '할 일',
  IN_PROGRESS: '진행 중',
  DONE: '완료',
}

const STATUS_ORDER = [STATUS.TODO, STATUS.IN_PROGRESS, STATUS.DONE]

const now = () => {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  return d.toISOString().slice(0, 16)
}

function getDuration(start, end) {
  if (!start || !end) return null
  const diff = new Date(end) - new Date(start)
  if (diff <= 0) return null
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  if (hours === 0) return `${minutes}분`
  if (minutes === 0) return `${hours}시간`
  return `${hours}시간 ${minutes}분`
}

function isOverdue(end, status) {
  if (!end || status === STATUS.DONE) return false
  return new Date(end) < new Date()
}

const EMPTY_FORM = { title: '', startAt: now(), endAt: '' }

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addTask = () => {
    const title = form.title.trim()
    if (!title) return
    setTasks([
      ...tasks,
      { id: Date.now(), title, startAt: form.startAt, endAt: form.endAt, status: STATUS.TODO },
    ])
    setForm(EMPTY_FORM)
  }

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id))

  const changeStatus = (id) => {
    setTasks(tasks.map((t) => {
      if (t.id !== id) return t
      const nextIndex = (STATUS_ORDER.indexOf(t.status) + 1) % STATUS_ORDER.length
      return { ...t, status: STATUS_ORDER[nextIndex] }
    }))
  }

  const startEdit = (task) => {
    setEditId(task.id)
    setEditForm({ title: task.title, startAt: task.startAt, endAt: task.endAt })
  }

  const saveEdit = (id) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, ...editForm } : t))
    setEditId(null)
    setEditForm(null)
  }

  const statusClass = (status) => {
    if (status === STATUS.TODO) return 'tag todo'
    if (status === STATUS.IN_PROGRESS) return 'tag progress'
    return 'tag done'
  }

  const fmt = (dt) => dt ? dt.replace('T', ' ') : '-'

  return (
    <div className="container">
      <h1>업무 관리</h1>

      {/* 입력 폼 */}
      <div className="form-box">
        <input
          name="title"
          type="text"
          placeholder="업무명을 입력하세요"
          value={form.title}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <div className="date-row">
          <label>
            시작일시
            <input name="startAt" type="datetime-local" value={form.startAt} onChange={handleChange} />
          </label>
          <label>
            마감일시
            <input name="endAt" type="datetime-local" value={form.endAt} onChange={handleChange} />
          </label>
          {getDuration(form.startAt, form.endAt) && (
            <span className="duration">총 {getDuration(form.startAt, form.endAt)}</span>
          )}
        </div>
        <button className="btn-add" onClick={addTask}>업무 추가</button>
      </div>

      {/* 업무 목록 */}
      {tasks.length === 0 ? (
        <p className="empty">등록된 업무가 없습니다.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={`task-item${isOverdue(task.endAt, task.status) ? ' overdue' : ''}`}>
              {editId === task.id ? (
                <div className="edit-box">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="업무명"
                  />
                  <div className="date-row">
                    <label>
                      시작
                      <input type="datetime-local" value={editForm.startAt}
                        onChange={(e) => setEditForm({ ...editForm, startAt: e.target.value })} />
                    </label>
                    <label>
                      마감
                      <input type="datetime-local" value={editForm.endAt}
                        onChange={(e) => setEditForm({ ...editForm, endAt: e.target.value })} />
                    </label>
                  </div>
                  <div className="edit-actions">
                    <button className="btn-save" onClick={() => saveEdit(task.id)}>저장</button>
                    <button className="btn-cancel" onClick={() => setEditId(null)}>취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="task-info">
                    <span className="task-title">
                      {task.title}
                      {isOverdue(task.endAt, task.status) && <span className="overdue-badge">기한 초과</span>}
                    </span>
                    <span className="task-dates">
                      {fmt(task.startAt)} ~ {fmt(task.endAt)}
                      {getDuration(task.startAt, task.endAt) && (
                        <span className="duration"> ({getDuration(task.startAt, task.endAt)})</span>
                      )}
                    </span>
                  </div>
                  <div className="actions">
                    <button className={statusClass(task.status)} onClick={() => changeStatus(task.id)}>
                      {task.status}
                    </button>
                    <button className="btn-edit" onClick={() => startEdit(task)}>수정</button>
                    <button className="btn-delete" onClick={() => deleteTask(task.id)}>삭제</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
