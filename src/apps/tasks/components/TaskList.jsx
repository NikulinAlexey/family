import { getChain } from "../model/Task.js";
import Icon from "@/shared/ui/Icon.jsx";

function TaskRow({ task, allTasks, pending, onToggle, onEdit }) {
  const classNames = ["task"];
  const urgencyLevel = task.urgencyLevel();
  if (urgencyLevel) classNames.push(urgencyLevel);

  let style;
  if (task.chain_id) {
    const chain = getChain(allTasks, task);
    const position = chain.findIndex(t => t.id === task.id);
    const progress = chain.length ? ((position + 1) / chain.length) * 100 : 0;
    classNames.push("chain-task");
    style = { "--chain-progress": `${progress}%` };
  }

  if (pending) classNames.push("task-completed-pending");

  return (
    <div className={classNames.join(" ")} style={style}>
      <input
        type="checkbox"
        checked={pending}
        onChange={event => onToggle(task, event.target.checked)}
      />
      <span className="task-text" onClick={() => onEdit(task)}>
        {task.text}
      </span>
      {task.repeat_days ? (
        <span
          className="task-repeat-icon"
          title={`Повторяется каждые ${task.repeat_days} дн.`}
        >
          <Icon name="repeat" size={18} />
        </span>
      ) : null}
    </div>
  );
}

export default function TaskList({ tasks, allTasks, pendingIds, onToggle, onEdit }) {
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          allTasks={allTasks}
          pending={pendingIds.has(task.id)}
          onToggle={onToggle}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
