/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

import { USER_ID, getUser } from './api/users';
import {
  deleteTodo,
  getTodos,
  postTodo,
  patchTodo,
} from './api/todos';

import { Status } from './types/Status';

import TodosFilter from './components/TodosFilter';

const App: React.FC = () => {
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const activeTodos = useMemo(() => (
    todos.filter(todo => !todo.completed)
  ), [todos]);

  const placeholder = useMemo(() => (
    isLoading ? 'Loading...' : 'Couldn\'t connect to server'
  ), [isLoading]);

  useEffect(() => {
    getTodos(USER_ID).then(setTodos);
    getUser(USER_ID)
      .then(userFromServer => {
        setUser(userFromServer);
        setLoading(false);
      });
  }, []);

  const addTodo = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTodo: TodoToPost = {
      userId: USER_ID,
      title: input,
      completed: false,
    };

    postTodo(newTodo)
      .then(() => {
        setInput('');
        getTodos(USER_ID).then(setTodos);
      });
  }, [USER_ID, input]);

  const toggleAll = useCallback(() => {
    const newTodos: Todo[] = [];

    if (activeTodos.length === 0 || activeTodos.length === todos.length) {
      todos.forEach(todo => {
        patchTodo(todo.id, { completed: !todo.completed });
        newTodos.push({ ...todo, completed: !todo.completed });
      });
    } else {
      todos.forEach(todo => {
        if (!todo.completed) {
          patchTodo(todo.id, { completed: true });
          newTodos.push({ ...todo, completed: true });
        } else {
          newTodos.push(todo);
        }
      });
    }

    setTodos(newTodos);
  }, [todos, activeTodos]);

  const clearCompleted = useCallback(() => {
    const newTodos: Todo[] = [];

    todos.forEach(todo => {
      if (todo.completed) {
        deleteTodo(todo.id);
      } else {
        newTodos.push(todo);
      }
    });

    setTodos(newTodos);
  }, [todos]);

  return (
    <section className="todoapp">
      <header className="header">
        <h1>
          {user
            ? `${user.name} todos`
            : placeholder}
        </h1>

        <form onSubmit={addTodo}>
          <input
            type="text"
            className="new-todo"
            placeholder="What needs to be done?"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </form>
      </header>

      <section className="main">
        <input
          type="checkbox"
          id="toggle-all"
          className="toggle-all"
          onChange={toggleAll}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>

        {todos.length > 0 && <TodosFilter todos={todos} setTodos={setTodos} />}
      </section>

      {todos.length > 0 && (
        <footer className="footer">
          <span className="todo-count">
            {`${activeTodos.length} items left`}
          </span>

          <ul className="filters">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => classNames({ selected: isActive })}
              >
                All
              </NavLink>
            </li>

            <li>
              <NavLink
                to={`/${Status.Active}`}
                className={({ isActive }) => classNames({ selected: isActive })}
              >
                Active
              </NavLink>
            </li>

            <li>
              <NavLink
                to={`/${Status.Completed}`}
                className={({ isActive }) => classNames({ selected: isActive })}
              >
                Completed
              </NavLink>
            </li>
          </ul>

          {activeTodos.length !== todos.length && (
            <button
              type="button"
              className="clear-completed"
              onClick={clearCompleted}
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
};

export default App;