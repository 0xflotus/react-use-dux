
import React, { memo, useEffect, useCallback } from 'react';
import { useReduxBindActionCreators, useReduxState } from 'react-use-dux';
import { useKeypressHandler } from '../hooks/useKeyPressHandler';
import { useClickOutside } from '../hooks/useClickOutside';
import { itemActions } from '../dux/actions/todoActions';
import { createTodoItemSelector, createIsEditingSelector } from '../dux/selectors/todoSelectors';

const TodoItem = memo(({ id }) => {

    const { editTodo, removeTodo, toggleTodo, updateTodoText, stopEditingTodo } = useReduxBindActionCreators(itemActions);

    const { text, isCompleted } = useReduxState(createTodoItemSelector(id), [id]);
    const editing = useReduxState(createIsEditingSelector(id), [id]);

    const textBoxRef = useClickOutside(stopEditingTodo, editing);

    const keypressHandler = useKeypressHandler({
        'Enter': stopEditingTodo,
    });

    const updateTodoTextCb = useCallback(e => updateTodoText(e.target.value), [updateTodoText]);
    const toggleTodoCb = useCallback(() => toggleTodo(id), [id, toggleTodo]);
    const editTodoCb = useCallback(() => editTodo(id), [id, editTodo]);
    const removeTodoCb = useCallback(() => removeTodo(id), [id, removeTodo]);

    useEffect(() => {
        if(editing) {
            textBoxRef.current.focus();
        }
    },[editing]);

    return (
        <li className={ editing ? 'editing' : '' }>
            <div className="view">
                <input type="checkbox" className="toggle" checked={isCompleted} onChange={ toggleTodoCb } />
                <label onDoubleClick={editTodoCb}>{text}</label>
                <button className="destroy" onClick={ removeTodoCb }></button>
            </div>
            <input type="text" className="edit" ref={textBoxRef} value={ text } onChange={ updateTodoTextCb } onKeyPress={ keypressHandler } />
        </li>
    );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem;