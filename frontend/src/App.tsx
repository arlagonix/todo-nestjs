import autoAnimate from "@formkit/auto-animate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import "./App.css";
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <>
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

      <ul ref={parent}>
        {todos.map((item) => (
          <li key={item.id}>
            <input
              type="checkbox"
              readOnly
              checked={item.isChecked}
              name="todo"
            />
            <span>{item.id}</span>
            <span>{item.text}</span>
            <span>
              <button
                type="button"
                onClick={() => deleteTodoMutation.mutate(item.id)}
              >
                Del
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => deleteTodosMutation.mutate()}>
        Delete all todos
      </button>
    </>
  );
}

export default App;
