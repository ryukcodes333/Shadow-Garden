import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type User = {
  id: string;
  name: string;
  phone: string;
  level: number;
  xp: number;
  balance: number;
  bank: number;
  gems: number;
  premium: boolean;
  role: string;
  bio: string;
  registeredAt: string;
};

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: () =>
      fetch("/api/v1/auth/me", { credentials: "include" }).then((r) =>
        r.ok ? r.json().then((j) => j.user) : null
      ),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }).then(
        (r) => r.json()
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}