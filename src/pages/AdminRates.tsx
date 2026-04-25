import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import {
  AndroidBiometryStrength,
  BiometricAuth,
} from "@aparajita/capacitor-biometric-auth";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

type UserRole = "owner" | "editor";
type UserStatus = "pending" | "active" | "inactive" | "rejected";
type AuthView = "login" | "register";

type LoginFormState = {
  email: string;
  password: string;
};

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RateFormState = {
  ultratech: string;
  dalmia: string;
  steel56: string;
  steel8: string;
  steel10: string;
  steel12: string;
};

type AdminSession = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  token: string;
};

type QuickLoginProfile = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  quickLoginEnabled: true;
};

type ManagedUser = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  approvedBy: string;
  approvedAt: string;
};

type DashboardDialog =
  | { type: "confirmUpdate" }
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

type ApiResponse = Record<string, unknown>;

const QUICK_LOGIN_TOKEN_KEY = "maaAmbikaAuthToken";
const QUICK_LOGIN_PROFILE_KEY = "maaAmbikaQuickLoginProfile";
const LOCAL_RATES_STORAGE_KEY = "maa-ambika-admin-rates-preview";
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const ADMIN_BUILD_LABEL = "admin-token-2026-04-25-v1";

const initialLoginForm: LoginFormState = {
  email: "",
  password: "",
};

const initialRegisterForm: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const initialRateForm: RateFormState = {
  ultratech: "",
  dalmia: "",
  steel56: "",
  steel8: "",
  steel10: "",
  steel12: "",
};

const parseApiResponse = (rawResponse: unknown): ApiResponse | null => {
  if (!rawResponse) {
    return null;
  }

  if (typeof rawResponse === "object") {
    return rawResponse as ApiResponse;
  }

  if (typeof rawResponse === "string") {
    try {
      return JSON.parse(rawResponse) as ApiResponse;
    } catch {
      return { message: rawResponse };
    }
  }

  return null;
};

const fieldClass = (hasError = false) =>
  `mt-2 w-full rounded-2xl border px-4 py-4 text-lg outline-none transition ${
    hasError
      ? "border-red-500 bg-red-50 text-red-950"
      : "border-white/15 bg-slate-950/70 text-white placeholder:text-white/40 focus:border-amber-400"
  }`;

const labelClass = "text-sm font-semibold tracking-wide text-white/90";

const buttonClass =
  "inline-flex items-center justify-center rounded-2xl px-5 py-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const cardClass =
  "rounded-[28px] border border-white/10 bg-slate-950/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur";

const AdminRates = () => {
  const [authView, setAuthView] = useState<AuthView>("login");
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(initialRegisterForm);
  const [rateForm, setRateForm] = useState<RateFormState>(initialRateForm);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [quickLoginProfile, setQuickLoginProfile] =
    useState<QuickLoginProfile | null>(null);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showQuickLoginPrompt, setShowQuickLoginPrompt] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardSuccess, setDashboardSuccess] = useState("");
  const [dashboardDialog, setDashboardDialog] =
    useState<DashboardDialog>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);
  const [isSavingQuickLogin, setIsSavingQuickLogin] = useState(false);
  const [isSubmittingRates, setIsSubmittingRates] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const inactivityTimerRef = useRef<number | null>(null);

  const apiUrl = import.meta.env.VITE_RATES_UPDATE_API_URL?.trim();
  const apiSecret = import.meta.env.VITE_RATES_API_SECRET?.trim();
  const isNativeAndroid =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

  const canSubmitRates = useMemo(
    () => Object.values(rateForm).every((value) => value.trim() !== ""),
    [rateForm]
  );

  const clearAuthMessages = () => {
    setAuthError("");
    setAuthSuccess("");
  };

  const clearDashboardMessages = () => {
    setDashboardError("");
    setDashboardSuccess("");
    setDashboardDialog(null);
  };

  const clearAllMessages = () => {
    clearAuthMessages();
    clearDashboardMessages();
  };

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const resetRateForm = () => {
    setRateForm(initialRateForm);
  };

  const callAdminApi = async (payload: Record<string, unknown>) => {
    if (!apiUrl) {
      throw new Error("Update API is missing.");
    }

    if (!apiSecret) {
      throw new Error("API secret is missing.");
    }

    const requestBody = {
      secret: apiSecret,
      ...payload,
    };

    const response = isNativeAndroid
      ? await CapacitorHttp.post({
          url: apiUrl,
          headers: {
            "Content-Type": "application/json",
          },
          data: requestBody,
        })
      : await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          mode: "cors",
        });

    const parsed =
      "data" in response
        ? parseApiResponse(response.data)
        : parseApiResponse(await response.text());
    const status = "status" in response ? response.status : 0;
    const ok = "ok" in response ? response.ok : status >= 200 && status < 300;
    const message =
      (parsed?.message as string | undefined) ||
      (parsed?.error as string | undefined);

    if (!ok || parsed?.success === false) {
      throw new Error(
        message ||
          "Unable to reach Google Sheet API. Check internet, API URL, or deployment access."
      );
    }

    return parsed ?? {};
  };

  const saveQuickLoginCredentials = async (nextSession: AdminSession) => {
    if (!isNativeAndroid) {
      return;
    }

    const profile: QuickLoginProfile = {
      name: nextSession.name,
      email: nextSession.email,
      role: nextSession.role,
      status: nextSession.status,
      quickLoginEnabled: true,
    };

    await SecureStorage.set(QUICK_LOGIN_TOKEN_KEY, nextSession.token);
    await SecureStorage.set(QUICK_LOGIN_PROFILE_KEY, profile);
    setQuickLoginProfile(profile);
  };

  const clearQuickLoginCredentials = async () => {
    if (!isNativeAndroid) {
      setQuickLoginProfile(null);
      return;
    }

    try {
      await SecureStorage.remove(QUICK_LOGIN_TOKEN_KEY);
      await SecureStorage.remove(QUICK_LOGIN_PROFILE_KEY);
    } catch (error) {
      console.error("Unable to clear secure quick login data.", error);
    } finally {
      setQuickLoginProfile(null);
    }
  };

  const loadQuickLoginProfile = async () => {
    if (!isNativeAndroid) {
      return;
    }

    try {
      const profile = await SecureStorage.get(QUICK_LOGIN_PROFILE_KEY);
      if (
        profile &&
        typeof profile === "object" &&
        "quickLoginEnabled" in profile &&
        profile.quickLoginEnabled === true
      ) {
        const parsedProfile = profile as QuickLoginProfile;
        setQuickLoginProfile(parsedProfile);
        setLoginForm((current) => ({
          ...current,
          email: parsedProfile.email,
        }));
        setShowPasswordLogin(false);
      }
    } catch (error) {
      console.error("Unable to load quick login profile.", error);
      setQuickLoginProfile(null);
    }
  };

  const getStoredToken = async () => {
    if (!isNativeAndroid) {
      return "";
    }

    const token = await SecureStorage.get(QUICK_LOGIN_TOKEN_KEY);
    return typeof token === "string" ? token : "";
  };

  const promptDeviceSecurity = async () => {
    const biometryInfo = await BiometricAuth.checkBiometry();
    if (!(biometryInfo.isAvailable || biometryInfo.deviceIsSecure)) {
      throw new Error("Phone security verification failed. Please login with password.");
    }

    await BiometricAuth.authenticate({
      reason: "Unlock Maa Ambika admin",
      cancelTitle: "Use password",
      allowDeviceCredential: true,
      iosFallbackTitle: "Use passcode",
      androidTitle: "Maa Ambika Rates Admin",
      androidSubtitle: "Use phone security to continue",
      androidConfirmationRequired: false,
      androidBiometryStrength: AndroidBiometryStrength.weak,
    });
  };

  const resetInactivityTimer = () => {
    clearInactivityTimer();
    if (!session) {
      return;
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      void handleLogout("Logged out due to inactivity.");
    }, INACTIVITY_TIMEOUT_MS);
  };

  const handleSessionExpired = async (
    message = "Session expired. Please login again."
  ) => {
    await clearQuickLoginCredentials();
    clearDashboardMessages();
    clearInactivityTimer();
    setUsers([]);
    setSession(null);
    setShowQuickLoginPrompt(false);
    setShowPasswordLogin(true);
    setAuthError(message);
  };

  const loadUsers = async (token: string) => {
    setIsLoadingUsers(true);
    setDashboardError("");

    try {
      const response = await callAdminApi({
        action: "listUsers",
        token,
      });
      setUsers(Array.isArray(response.users) ? (response.users as ManagedUser[]) : []);
    } catch (error) {
      console.error("Unable to load users.", error);
      const message =
        error instanceof Error ? error.message : "Unable to load users.";
      if (message.includes("Session expired")) {
        await handleSessionExpired(message);
      } else {
        setDashboardError(message);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLogout = async (message = "") => {
    const activeToken = session?.token || (await getStoredToken());
    if (activeToken) {
      try {
        await callAdminApi({
          action: "logout",
          token: activeToken,
        });
      } catch (error) {
        console.error("Logout API call failed.", error);
      }
    }

    await clearQuickLoginCredentials();
    clearInactivityTimer();
    clearAllMessages();
    setShowQuickLoginPrompt(false);
    setShowPasswordLogin(true);
    setUsers([]);
    setSession(null);
    setLoginForm((current) => ({
      ...current,
      password: "",
    }));
    if (message) {
      setAuthSuccess(message);
    }
  };

  useEffect(() => {
    clearAllMessages();
    void loadQuickLoginProfile();
  }, []);

  useEffect(() => {
    clearAuthMessages();
    if (!session) {
      clearDashboardMessages();
    }
  }, [authView]);

  useEffect(() => {
    if (!session) {
      clearInactivityTimer();
      return;
    }

    const handleActivity = () => {
      resetInactivityTimer();
    };

    const events: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "scroll",
      "touchstart",
    ];

    resetInactivityTimer();
    events.forEach((eventName) =>
      window.addEventListener(eventName, handleActivity, { passive: true })
    );

    return () => {
      clearInactivityTimer();
      events.forEach((eventName) =>
        window.removeEventListener(eventName, handleActivity)
      );
    };
  }, [session]);

  useEffect(() => {
    if (!session?.token || session.role !== "owner") {
      return;
    }

    void loadUsers(session.token);
  }, [session?.token, session?.role]);

  useEffect(() => {
    if (!session || !dashboardDialog || dashboardDialog.type !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDashboardDialog(null);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [dashboardDialog, session]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAllMessages();
    setIsLoadingAuth(true);

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setAuthError("Enter email and password.");
      setIsLoadingAuth(false);
      return;
    }

    try {
      const response = await callAdminApi({
        action: "login",
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      const token = String(response.token ?? "");
      const user = (response.user ?? {}) as Partial<AdminSession>;
      if (!token || !user.email || !user.role || !user.status) {
        throw new Error("Invalid login response.");
      }

      const nextSession: AdminSession = {
        name: String(user.name ?? "Admin User"),
        email: String(user.email),
        role: user.role as UserRole,
        status: user.status as UserStatus,
        token,
      };

      setSession(nextSession);
      setAuthSuccess("Login successful.");
      setLoginForm((current) => ({
        ...current,
        password: "",
      }));
      if (isNativeAndroid) {
        setShowQuickLoginPrompt(true);
      }
    } catch (error) {
      console.error("Login failed.", error);
      setAuthError(
        error instanceof Error ? error.message : "Unable to login."
      );
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleQuickLogin = async () => {
    if (!isNativeAndroid || !quickLoginProfile) {
      return;
    }

    clearAllMessages();
    setIsQuickLoggingIn(true);

    try {
      await promptDeviceSecurity();
      const token = await getStoredToken();
      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await callAdminApi({
        action: "validateToken",
        token,
      });
      const user = (response.user ?? {}) as Partial<AdminSession>;
      if (!user.email || !user.role || !user.status) {
        throw new Error("Session expired. Please login again.");
      }

      setSession({
        name: String(user.name ?? quickLoginProfile.name),
        email: String(user.email),
        role: user.role as UserRole,
        status: user.status as UserStatus,
        token,
      });
      setAuthSuccess("Login successful.");
    } catch (error) {
      console.error("Quick login failed.", error);
      const message =
        error instanceof Error ? error.message : "Quick login failed.";
      if (message.includes("Session expired")) {
        await handleSessionExpired(message);
      } else {
        setAuthError(
          "Phone security verification failed. Please login with password."
        );
        setShowPasswordLogin(true);
      }
    } finally {
      setIsQuickLoggingIn(false);
    }
  };

  const handleEnableQuickLogin = async () => {
    if (!session || !isNativeAndroid) {
      return;
    }

    setIsSavingQuickLogin(true);
    clearDashboardMessages();

    try {
      await saveQuickLoginCredentials(session);
      setShowQuickLoginPrompt(false);
      setDashboardSuccess("Quick login enabled.");
    } catch (error) {
      console.error("Unable to enable quick login.", error);
      setDashboardError("Unable to enable quick login.");
    } finally {
      setIsSavingQuickLogin(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAllMessages();
    setIsLoadingAuth(true);

    if (
      !registerForm.name.trim() ||
      !registerForm.email.trim() ||
      !registerForm.password.trim() ||
      !registerForm.confirmPassword.trim()
    ) {
      setAuthError("Fill in all registration details.");
      setIsLoadingAuth(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      setIsLoadingAuth(false);
      return;
    }

    try {
      const response = await callAdminApi({
        action: "registerUser",
        user: {
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
          requestedRole: "editor",
        },
      });
      setAuthSuccess(
        String(response.message ?? "Registration submitted successfully.")
      );
      setRegisterForm(initialRegisterForm);
      setAuthView("login");
      setShowPasswordLogin(true);
      setLoginForm((current) => ({
        ...current,
        email: registerForm.email.trim(),
      }));
    } catch (error) {
      console.error("Registration failed.", error);
      setAuthError(
        error instanceof Error ? error.message : "Registration failed."
      );
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const buildRatesPayload = () => ({
    cement: [
      { item: "Ultratech", price: Number(rateForm.ultratech) },
      { item: "Dalmia", price: Number(rateForm.dalmia) },
    ],
    steel: [
      { item: "5/6mm", price: Number(rateForm.steel56) },
      { item: "8mm", price: Number(rateForm.steel8) },
      { item: "10mm", price: Number(rateForm.steel10) },
      { item: "12mm", price: Number(rateForm.steel12) },
    ],
  });

  const handleRateSubmit = async () => {
    if (!session?.token) {
      return;
    }

    setIsSubmittingRates(true);
    clearDashboardMessages();

    try {
      const payload = buildRatesPayload();
      localStorage.setItem(LOCAL_RATES_STORAGE_KEY, JSON.stringify(payload));

      const response = await callAdminApi({
        action: "updateRates",
        token: session.token,
        ...payload,
      });
      setDashboardDialog({
        type: "success",
        message: String(response.message ?? "Rates updated successfully."),
      });
    } catch (error) {
      console.error("Unable to update rates.", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update rates. Check internet.";
      if (message.includes("Session expired")) {
        await handleSessionExpired(message);
      } else {
        setDashboardDialog({
          type: "error",
          message,
        });
      }
    } finally {
      setIsSubmittingRates(false);
    }
  };

  const handleSaveLocally = () => {
    localStorage.setItem(
      LOCAL_RATES_STORAGE_KEY,
      JSON.stringify(buildRatesPayload())
    );
    setDashboardDialog({
      type: "success",
      message: "Rates saved locally for testing. Google Sheet is not updated yet.",
    });
  };

  const handleLoadSavedRates = () => {
    const raw = localStorage.getItem(LOCAL_RATES_STORAGE_KEY);
    if (!raw) {
      setDashboardDialog({
        type: "error",
        message: "No locally saved rate draft found.",
      });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        cement?: Array<{ item: string; price: number }>;
        steel?: Array<{ item: string; price: number }>;
      };
      setRateForm({
        ultratech: String(parsed.cement?.[0]?.price ?? ""),
        dalmia: String(parsed.cement?.[1]?.price ?? ""),
        steel56: String(parsed.steel?.[0]?.price ?? ""),
        steel8: String(parsed.steel?.[1]?.price ?? ""),
        steel10: String(parsed.steel?.[2]?.price ?? ""),
        steel12: String(parsed.steel?.[3]?.price ?? ""),
      });
      setDashboardSuccess("Loaded last saved rate draft.");
    } catch (error) {
      console.error("Unable to load saved local rates.", error);
      setDashboardError("Unable to load locally saved rates.");
    }
  };

  const handleApproveOrUpdateUser = async (
    targetEmail: string,
    role: UserRole,
    status: UserStatus
  ) => {
    if (!session?.token) {
      return;
    }

    clearDashboardMessages();
    try {
      const response = await callAdminApi({
        action: "approveUser",
        token: session.token,
        targetEmail,
        role,
        status,
      });
      setDashboardSuccess(
        String(response.message ?? "User updated successfully.")
      );
      await loadUsers(session.token);
    } catch (error) {
      console.error("Unable to update user.", error);
      const message =
        error instanceof Error ? error.message : "Unable to update user.";
      if (message.includes("Session expired")) {
        await handleSessionExpired(message);
      } else {
        setDashboardError(message);
      }
    }
  };

  const handleRejectUser = async (targetEmail: string) => {
    if (!session?.token) {
      return;
    }

    clearDashboardMessages();
    try {
      const response = await callAdminApi({
        action: "rejectUser",
        token: session.token,
        targetEmail,
      });
      setDashboardSuccess(
        String(response.message ?? "User rejected successfully.")
      );
      await loadUsers(session.token);
    } catch (error) {
      console.error("Unable to reject user.", error);
      const message =
        error instanceof Error ? error.message : "Unable to reject user.";
      if (message.includes("Session expired")) {
        await handleSessionExpired(message);
      } else {
        setDashboardError(message);
      }
    }
  };

  const renderAuthMessage = () => {
    if (!authError && !authSuccess) {
      return null;
    }

    const isError = Boolean(authError);
    return (
      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          isError
            ? "border-red-500/50 bg-red-500/10 text-red-100"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
        }`}
      >
        {isError ? authError : authSuccess}
      </div>
    );
  };

  const renderDashboardMessage = () => {
    if (!session) {
      return null;
    }

    if (dashboardDialog) {
      const isError = dashboardDialog.type === "error";
      return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5">
          <div className={`${cardClass} w-full max-w-md`}>
            <h3 className="text-xl font-semibold text-white">
              {isError ? "Update Error" : "Success"}
            </h3>
            <p className="mt-3 text-base leading-7 text-white/80">
              {dashboardDialog.message}
            </p>
            <button
              type="button"
              onClick={() => setDashboardDialog(null)}
              className={`${buttonClass} mt-6 w-full bg-amber-500 text-slate-950`}
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    if (!dashboardError && !dashboardSuccess) {
      return null;
    }

    const isError = Boolean(dashboardError);
    return (
      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          isError
            ? "border-red-500/50 bg-red-500/10 text-red-100"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
        }`}
      >
        {isError ? dashboardError : dashboardSuccess}
      </div>
    );
  };

  const ownerManageUsers =
    session?.role === "owner" ? (
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300/75">
              Manage Users
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Owner approvals
            </h2>
          </div>
          <button
            type="button"
            onClick={() => session?.token && void loadUsers(session.token)}
            className={`${buttonClass} bg-white/10 px-4 py-3 text-white`}
            disabled={isLoadingUsers}
          >
            {isLoadingUsers ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {users.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/70">
              No users found yet.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.email}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {user.name || "Unnamed user"}
                    </p>
                    <p className="text-sm text-white/70">{user.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">
                      {user.role} • {user.status}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handleApproveOrUpdateUser(
                          user.email,
                          user.role === "owner" ? "owner" : "editor",
                          "active"
                        )
                      }
                      className={`${buttonClass} bg-emerald-500 text-slate-950`}
                    >
                      Approve Active
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleApproveOrUpdateUser(
                          user.email,
                          "editor",
                          "inactive"
                        )
                      }
                      className={`${buttonClass} bg-white/10 text-white`}
                    >
                      Set Inactive
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleApproveOrUpdateUser(
                          user.email,
                          "owner",
                          "active"
                        )
                      }
                      className={`${buttonClass} bg-amber-400 text-slate-950`}
                    >
                      Make Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRejectUser(user.email)}
                      className={`${buttonClass} bg-red-500 text-white`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    ) : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_38%),linear-gradient(180deg,#07111f_0%,#030712_100%)] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300/80">
              Maa Ambika Rates Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              Secure admin rate dashboard
            </h1>
          </div>
          <p className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
            Build: {ADMIN_BUILD_LABEL}
          </p>
        </div>

        {!session ? (
          <section className={`${cardClass} mx-auto max-w-2xl`}>
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
              <button
                type="button"
                onClick={() => setAuthView("login")}
                className={`${buttonClass} flex-1 ${
                  authView === "login"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-transparent text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthView("register")}
                className={`${buttonClass} flex-1 ${
                  authView === "register"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-transparent text-white"
                }`}
              >
                Create User / Register
              </button>
            </div>

            <div className="mt-6">{renderAuthMessage()}</div>

            {authView === "login" ? (
              <div className="mt-6 space-y-6">
                {quickLoginProfile && !showPasswordLogin ? (
                  <div className="rounded-[24px] border border-amber-400/30 bg-amber-500/10 p-5">
                    <p className="text-sm uppercase tracking-[0.25em] text-amber-200/80">
                      Welcome back
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {quickLoginProfile.name}
                    </h2>
                    <p className="mt-2 text-sm text-white/70">
                      Login with phone security to unlock your saved token, or
                      choose password login instead.
                    </p>
                    <div className="mt-5 grid gap-3">
                      <button
                        type="button"
                        onClick={() => void handleQuickLogin()}
                        className={`${buttonClass} bg-amber-400 text-slate-950`}
                        disabled={isQuickLoggingIn}
                      >
                        {isQuickLoggingIn
                          ? "Checking phone security..."
                          : "Login with Phone Security"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordLogin(true)}
                        className={`${buttonClass} bg-white/10 text-white`}
                      >
                        Login with Password
                      </button>
                    </div>
                  </div>
                ) : null}

                {(!quickLoginProfile || showPasswordLogin) && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className={labelClass} htmlFor="admin-email">
                        Admin Email
                      </label>
                      <input
                        id="admin-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className={fieldClass()}
                        placeholder="owner@example.com"
                        autoComplete="username"
                        disabled={isLoadingAuth}
                      />
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="admin-password">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="admin-password"
                          type={showLoginPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={(event) =>
                            setLoginForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          className={`${fieldClass()} pr-28`}
                          placeholder="Enter password"
                          autoComplete="current-password"
                          disabled={isLoadingAuth}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowLoginPassword((current) => !current)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/70"
                        >
                          {showLoginPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`${buttonClass} w-full bg-amber-400 text-slate-950`}
                      disabled={isLoadingAuth}
                    >
                      {isLoadingAuth ? "Logging in..." : "Login"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleRegister} className="mt-6 space-y-5">
                <div>
                  <label className={labelClass} htmlFor="register-name">
                    Name
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    placeholder="Owner or staff name"
                    disabled={isLoadingAuth}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="register-email">
                    Email
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    placeholder="email@example.com"
                    disabled={isLoadingAuth}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="register-password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      className={`${fieldClass()} pr-28`}
                      placeholder="Create password"
                      disabled={isLoadingAuth}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/70"
                    >
                      {showRegisterPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={labelClass}
                    htmlFor="register-confirm-password"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      type={
                        showRegisterConfirmPassword ? "text" : "password"
                      }
                      value={registerForm.confirmPassword}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      className={`${fieldClass()} pr-28`}
                      placeholder="Confirm password"
                      disabled={isLoadingAuth}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterConfirmPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/70"
                    >
                      {showRegisterConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Requested Role</label>
                  <input
                    type="text"
                    value="editor"
                    readOnly
                    className={fieldClass()}
                  />
                </div>

                <button
                  type="submit"
                  className={`${buttonClass} w-full bg-amber-400 text-slate-950`}
                  disabled={isLoadingAuth}
                >
                  {isLoadingAuth
                    ? "Submitting registration..."
                    : "Submit Registration"}
                </button>
              </form>
            )}
          </section>
        ) : (
          <div className="space-y-6">
            {renderDashboardMessage()}

            {showQuickLoginPrompt && isNativeAndroid ? (
              <section className={cardClass}>
                <h2 className="text-2xl font-semibold text-white">
                  Enable quick login with phone security?
                </h2>
                <p className="mt-3 text-base leading-7 text-white/75">
                  Your backend-authenticated token can be stored securely on this
                  device. Next time, phone security will unlock the saved token
                  and the app will validate it with the backend before opening
                  the dashboard.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void handleEnableQuickLogin()}
                    className={`${buttonClass} bg-amber-400 text-slate-950`}
                    disabled={isSavingQuickLogin}
                  >
                    {isSavingQuickLogin ? "Saving..." : "Enable Quick Login"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickLoginPrompt(false)}
                    className={`${buttonClass} bg-white/10 text-white`}
                  >
                    Not now
                  </button>
                </div>
              </section>
            ) : null}

            <section className={cardClass}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-300/75">
                    Logged In
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    Welcome, {session.name}
                  </h2>
                  <p className="mt-2 text-sm text-white/70">
                    {session.email} • {session.role} • {session.status}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {quickLoginProfile ? (
                    <button
                      type="button"
                      onClick={() => void clearQuickLoginCredentials()}
                      className={`${buttonClass} bg-white/10 text-white`}
                    >
                      Disable Quick Login
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className={`${buttonClass} bg-red-500 text-white`}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-300/75">
                    Today&apos;s Selling Rates
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Update cement and steel rates
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Use your backend token-based session to update Google Sheet
                    rates. Session expires after 7 days or immediate logout.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!canSubmitRates) {
                    setDashboardError("Please enter all rates.");
                    return;
                  }
                  setDashboardDialog({ type: "confirmUpdate" });
                }}
                className="mt-6 grid gap-5 md:grid-cols-2"
              >
                <div>
                  <label className={labelClass} htmlFor="ultratech">
                    Ultratech
                  </label>
                  <input
                    id="ultratech"
                    inputMode="decimal"
                    type="number"
                    value={rateForm.ultratech}
                    onChange={(event) =>
                      setRateForm((current) => ({
                        ...current,
                        ultratech: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    disabled={isSubmittingRates}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="dalmia">
                    Dalmia
                  </label>
                  <input
                    id="dalmia"
                    inputMode="decimal"
                    type="number"
                    value={rateForm.dalmia}
                    onChange={(event) =>
                      setRateForm((current) => ({
                        ...current,
                        dalmia: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    disabled={isSubmittingRates}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="steel56">
                    5/6mm
                  </label>
                  <input
                    id="steel56"
                    inputMode="decimal"
                    type="number"
                    value={rateForm.steel56}
                    onChange={(event) =>
                      setRateForm((current) => ({
                        ...current,
                        steel56: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    disabled={isSubmittingRates}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="steel8">
                    8mm
                  </label>
                  <input
                    id="steel8"
                    inputMode="decimal"
                    type="number"
                    value={rateForm.steel8}
                    onChange={(event) =>
                      setRateForm((current) => ({
                        ...current,
                        steel8: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    disabled={isSubmittingRates}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="steel10">
                    10mm
                  </label>
                  <input
                    id="steel10"
                    inputMode="decimal"
                    type="number"
                    value={rateForm.steel10}
                    onChange={(event) =>
                      setRateForm((current) => ({
                        ...current,
                        steel10: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    disabled={isSubmittingRates}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="steel12">
                    12mm
                  </label>
                  <input
                    id="steel12"
                    inputMode="decimal"
                    type="number"
                    value={rateForm.steel12}
                    onChange={(event) =>
                      setRateForm((current) => ({
                        ...current,
                        steel12: event.target.value,
                      }))
                    }
                    className={fieldClass()}
                    disabled={isSubmittingRates}
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-4 text-sm leading-7 text-amber-50">
                    Please confirm all rates before updating. Every sensitive
                    action now uses your backend-validated auth token.
                  </p>
                </div>

                <div className="grid gap-3 md:col-span-2 md:grid-cols-4">
                  <button
                    type="submit"
                    className={`${buttonClass} bg-amber-400 text-slate-950`}
                    disabled={isSubmittingRates}
                  >
                    {isSubmittingRates ? "Updating..." : "Update Rates"}
                  </button>
                  <button
                    type="button"
                    onClick={resetRateForm}
                    className={`${buttonClass} bg-white/10 text-white`}
                    disabled={isSubmittingRates}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLocally}
                    className={`${buttonClass} bg-white/10 text-white`}
                    disabled={isSubmittingRates}
                  >
                    Save Locally for Testing
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSavedRates}
                    className={`${buttonClass} bg-white/10 text-white`}
                    disabled={isSubmittingRates}
                  >
                    Load Last Saved Data
                  </button>
                </div>
              </form>
            </section>

            {ownerManageUsers}
          </div>
        )}
      </div>

      {session && dashboardDialog?.type === "confirmUpdate" ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5">
          <div className={`${cardClass} w-full max-w-md`}>
            <h3 className="text-xl font-semibold text-white">Confirm Update</h3>
            <p className="mt-3 text-base leading-7 text-white/80">
              Do you want to update today&apos;s rates?
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDashboardDialog(null)}
                className={`${buttonClass} bg-white/10 text-white`}
                disabled={isSubmittingRates}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleRateSubmit()}
                className={`${buttonClass} bg-amber-400 text-slate-950`}
                disabled={isSubmittingRates}
              >
                {isSubmittingRates ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default AdminRates;
