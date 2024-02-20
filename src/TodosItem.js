import React from 'react';

function TodoItem({ index, todo, toggleTodo, removeTodo }) {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(index)}
      />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      <button onClick={() => removeTodo(index)}>Remove</button>
    </li>
  );
}

export default TodoItem;
