
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchUserAttributes } from "aws-amplify/auth";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    emailVerified: false,
    loading: true,
  });

  const refreshProfile = useCallback(async () => {
    try {
      const attributes = await fetchUserAttributes();

      setProfile({
        name:
          attributes.name ||
          attributes.preferred_username ||
          attributes.email?.split("@")[0] ||
          "CloudSight User",
        email: attributes.email || "",
        emailVerified: attributes.email_verified === "true",
        loading: false,
      });
    } catch (error) {
      console.error("Could not load profile:", error);
      setProfile((previous) => ({
        ...previous,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = useCallback((updates) => {
    setProfile((previous) => ({
      ...previous,
      ...updates,
    }));
  }, []);

  return (
    <ProfileContext.Provider
      value={{ profile, updateProfile, refreshProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider"
    );
  }

  return context;
}
