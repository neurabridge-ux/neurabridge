import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";

export const useAuth = (redirectPath?: string | null) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await authService.signIn(email, password);

      const profile = await profileService.getProfile(user.id);

      if (redirectPath) {
        navigate(redirectPath);
      } else if (profile) {
        navigate(profile.user_type === "expert" ? "/expert/dashboard" : "/investor/dashboard");
      }
    } catch (error: any) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please verify your email before logging in. Check your inbox for the verification link.", {
          duration: 6000,
        });
      } else {
        toast.error(error.message || "An error occurred");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    userType: string
  ) => {
    setLoading(true);
    try {
      const { user } = await authService.signUp(email, password, {
        user_type: userType,
        name: name,
      });

      if (user) {
        if (userType === "expert") {
          await authService.createExpertProfile(user.id);
        } else {
          await authService.createInvestorProfile(user.id);
        }

        toast.success("Account created! Please check your email to verify your account before logging in.", {
          duration: 6000,
        });
        return true;
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      throw error;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    loading,
    handleSignIn,
    handleSignUp,
    handleSignOut,
  };
};
