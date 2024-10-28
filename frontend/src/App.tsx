import checkmarkChecked from "@assets/checkmark-checked.svg";
import checkmarkUnchecked from "@assets/checkmark-unchecked.svg";
import deleteIcon from "@assets/delete.svg";
import autoAnimate from "@formkit/auto-animate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import styles from "./app.module.css";
import { API_PATH } from "./consts";

interface Todo {
  id: number;
  text: string;
  isChecked: boolean;
}

function App() {
  const queryClient = useQueryClient();
  const parent = useRef(null);

  useEffect(() => {
    if (parent.current) autoAnimate(parent.current);
  }, [parent]);

  const createTodoMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch(`${API_PATH}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });
      const data = await response.json();
      if (!response.ok || !String(response.status).startsWith("2")) {
        throw data;
      }
      return data;
    },
    onSuccess: (data: {
      details: {
        id: string;
      };
    }) => {
      toast.success(`Created a todo with id ${data?.details?.id}`);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (data: { message: string }) => {
      toast.error("Failed to create a todo", { description: data.message });
    },
  });

  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await fetch(`${API_PATH}/todos`);
      if (!response.ok) {
        toast.error(`Failed to fetch todos`);
      }
      return response.json();
    },
  });

  const deleteTodosMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_PATH}/todos`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error(`Failed to delete todos`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_PATH}/todos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error(`Failed to delete todo with id ${id}`);
      }
    },
    onSuccess: (_data, id) => {
      toast.success(`Deleted todo with id ${id}`);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // const updateTodoMutation = useMutation({
  //   mutationFn: async (id: number, newTodo: any ) => {
  //     const response = await fetch(`${API_PATH}/todos/${id}`, {
  //       method: "PATCH",
  //     });
  //     if (!response.ok) {
  //       toast.error(`Failed to delete todo with id ${id}`);
  //     }
  //   },
  //   onSuccess: (_data, id) => {
  //     toast.success(`Updated todo with id ${id}`);
  //     queryClient.invalidateQueries({ queryKey: ["todos"] });
  //   },
  // });

  const updateTodoMutation = useMutation({
    mutationFn: async (updatedTodo: Todo) => {
      const response = await fetch(`${API_PATH}/todos/${updatedTodo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: updatedTodo.text,
          isChecked: updatedTodo.isChecked,
        }),
      });
      const data = await response.json();
      if (!response.ok || !String(response.status).startsWith("2")) {
        throw data;
      }
      return data;
    },
    onSuccess: (_data, updatedTodo: Todo) => {
      toast.success(`Updated the todo with id ${updatedTodo.id}`);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (data: { message: string }) => {
      toast.error("Failed to update the todo", { description: data.message });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.title}>Todo App</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.target as HTMLFormElement);
            const todo = formData.get("todo");
            createTodoMutation.mutate(String(todo));
          }}
        >
          <input defaultValue="test" name="todo" />
          <button>Add todo</button>
        </form>

        <ul ref={parent} className={styles.list}>
          {todos.map((item) => (
            <li key={item.id}>
              <label className={styles["list-item"]}>
                <div>
                  <input
                    type="checkbox"
                    readOnly
                    checked={item.isChecked}
                    name="todo"
                    className={styles.input}
                    onChange={() => {
                      updateTodoMutation.mutate({
                        id: item.id,
                        text: item.text,
                        isChecked: !item.isChecked,
                      });
                    }}
                  />
                  {item.isChecked && (
                    <img src={checkmarkChecked} width={24} height={24} />
                  )}
                  {!item.isChecked && (
                    <img src={checkmarkUnchecked} width={24} height={24} />
                  )}
                </div>
                <span>{item.id}</span>
                <span
                  className={clsx(
                    styles["todo-text"],
                    item.isChecked && styles["is-checked"]
                  )}
                >
                  {item.text}
                </span>
                <span>
                  <button
                    type="button"
                    onClick={() => deleteTodoMutation.mutate(item.id)}
                  >
                    <img src={deleteIcon} width={24} height={24} />
                  </button>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => deleteTodosMutation.mutate()}>
          Delete all todos
        </button>
      </main>
    </>
  );
}

export default App;
