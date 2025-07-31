import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { resetVotingState } from "@/src/features/voting/store/votingSlice";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const logout = useCallback(() => {
    dispatch(resetVotingState());
    
    localStorage.removeItem("loginTime");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    
    router.push("/login");
  }, [router, dispatch]);

  return { logout };
};