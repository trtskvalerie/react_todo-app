/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';

import { USER_ID } from '../../api/users';
import { deleteTodo, getTodos, patchTodo } from '../../api/todos';

import Error from '../Error';

type Props = {
  todo: Todo,
  setTodos: (todos: Todo[]) => void,
};

export const TodoItem: React.FC<Props> = React.memo(({ todo, setTodos }) => {
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const editRef = useRef(document.createElement('input'));

  const errorHandler = useCallback(() => {
    setError(true);
    setTimeout(() => setError(false), 1500);
  }, []);

  const toggleCompleted = useCallback(() => {
    patchTodo(todo.id, { completed: !todo.completed })
      .then(() => getTodos(USER_ID))
      .then(setTodos)
      .catch(errorHandler);
  }, [todo]);

  const destroyTodo = useCallback(() => {
    deleteTodo(todo.id)
      .then(() => getTodos(USER_ID))
      .then(setTodos)
      .catch(() => {
        setError(true);
        setTimeout(() => setError(false), 1000);
      });
  }, [todo]);

  const enableEditing = useCallback(() => {
    setEditing(true);
  }, []);

  const applyTitle = useCallback(() => {
    if (!title) {
      deleteTodo(todo.id)
        .then(() => getTodos(USER_ID))
        .then(setTodos)
        .catch(() => {
          setTitle(todo.title);
          errorHandler();
        });
    } else {
      setEditing(false);
      patchTodo(todo.id, { title })
        .then(() => getTodos(USER_ID))
        .then(setTodos)
        .catch(() => {
          setTitle(todo.title);
          errorHandler();
        });
    }
  }, [title]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'Enter':
          applyTitle();
          break;

        case 'Escape':
          setEditing(false);
          setTitle(todo.title);
          break;

        default:
          break;
      }
    },
    [todo],
  );

  useEffect(() => {
    if (editing) {
      editRef.current.focus();
    }
  }, [editing]);

  return (
    <>
      <li
        key={todo.id}
        className={classNames(
          { completed: todo.completed },
          { editing },
        )}
      >
        <div className="view">
          <input
            type="checkbox"
            className="toggle"
            checked={todo.completed}
            onChange={toggleCompleted}
          />

          <label onDoubleClick={enableEditing}>{todo.title}</label>

          <button
            type="button"
            className="destroy"
            onClick={destroyTodo}
          />
        </div>
        <input
          type="text"
          className="edit"
          ref={editRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={applyTitle}
          onKeyDown={handleKeyPress}
        />
      </li>
      {error && <Error message="Server error: try again later" />}
    </>
  );
});