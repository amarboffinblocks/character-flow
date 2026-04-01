"use client";
import React, { useMemo } from "react";
import { LogOut, Menu, Trash2, Loader2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import DynamicForm from "../elements/form-elements/dynamic-form";
import { profileSchema } from "@/schemas/profile-schema";
import { useLogout, useCurrentUser, useUpdateProfile } from "@/hooks";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import UsernameInput from "@/components/ui/username-input";
interface Props {
    characterId?: string;
}

const ProfileForm: React.FC<Props> = () => {
    const USERNAME_CHANGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
    const { logout, isLoading: isLoggingOut } = useLogout();
    const { user, isLoading: isUserLoading } = useCurrentUser();
    const { updateProfileAsync, isLoading: isUpdatingProfile } = useUpdateProfile();
    const [isUsernameDialogOpen, setIsUsernameDialogOpen] = React.useState(false);
    const [usernameInput, setUsernameInput] = React.useState("");
    const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = React.useState(false);
    const [hasUsernameCheckError, setHasUsernameCheckError] = React.useState(false);

    // Disable all schema-level validation for profile form
    const profileSchemaWithoutValidation = useMemo(
        () => profileSchema.map((field) => ({ ...field, required: false })),
        []
    );

    const initialValues = useMemo(() => {
        if (!user) return {};
        return {
            avatar: user.avatar,
            username: user.username,
            email: user.email,
            visiable: user.profileVisibility,
            rating: user.profileRating,
            theme: user.theme,
            fontStyle: user.fontStyle,
            fontSize: user.fontSize,
            language: user.language,
            tags: user.tagsToFollow,
            "tag-to-avoid": user.tagsToAvoid,
            aboutme: user.aboutMe,
            following: Array.isArray(user.following)
                ? user.following.join(", ")
                : (typeof user.following === "string" ? user.following : ""),
            plan: user.subscriptionPlan,
        };
    }, [user]);

    const handleSubmit = async (values: any) => {
        try {
            const profileData: any = {
                username: values.username,
                aboutMe: values.aboutme,
                theme: values.theme,
                fontStyle: values.fontStyle,
                fontSize: values.fontSize,
                language: values.language,
                tagsToFollow: values.tags,
                tagsToAvoid: values["tag-to-avoid"],
                profileVisibility: values.visiable,
                profileRating: values.rating,
                subscriptionPlan: values.plan,
            };

            // Use profile multipart endpoint for avatar uploads.
            if (values.avatar instanceof File) {
                profileData.avatar = values.avatar;
            }
            await updateProfileAsync(profileData);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    const handleOpenUsernameDialog = () => {
        if (isUsernameCooldownActive) {
            toast.info(`You can change your username again in ${usernameCooldownLabel}.`);
            return;
        }
        setUsernameInput(user?.username ?? "");
        setUsernameAvailable(null);
        setIsCheckingUsername(false);
        setHasUsernameCheckError(false);
        setIsUsernameDialogOpen(true);
    };

    const handleConfirmUsernameChange = async () => {
        const nextUsername = usernameInput.trim();
        if (!nextUsername || nextUsername === user?.username) {
            setIsUsernameDialogOpen(false);
            return;
        }

        if (isCheckingUsername) {
            toast.info("Please wait until username check completes.");
            return;
        }

        if (usernameAvailable !== true) {
            toast.error("This username is not available.");
            return;
        }

        await updateProfileAsync({ username: nextUsername });
        setIsUsernameDialogOpen(false);
    };

    const usernameCooldownRemainingMs = useMemo(() => {
        if (!user?.usernameChangedAt) return 0;
        const elapsedMs = Date.now() - new Date(user.usernameChangedAt).getTime();
        return Math.max(0, USERNAME_CHANGE_COOLDOWN_MS - elapsedMs);
    }, [user?.usernameChangedAt]);

    const isUsernameCooldownActive = usernameCooldownRemainingMs > 0;

    const usernameCooldownLabel = useMemo(() => {
        if (!isUsernameCooldownActive) return "";
        const totalMinutes = Math.ceil(usernameCooldownRemainingMs / (60 * 1000));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
    }, [isUsernameCooldownActive, usernameCooldownRemainingMs]);

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="py-10">
            <DynamicForm
                schema={profileSchemaWithoutValidation}
                initialValues={initialValues}
                isSubmitting={isUpdatingProfile}
                onSubmit={handleSubmit}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            Account Menu <Menu />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleOpenUsernameDialog} disabled={isUsernameCooldownActive}>
                                Change Username 
                                {isUsernameCooldownActive && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        ({usernameCooldownLabel} left)
                                    </span>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="bg-primary/50" />

                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                Bulk Export Workspace
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault();
                                if (!isLoggingOut) logout();
                            }}>
                                Logout
                                <DropdownMenuShortcut><LogOut className="size-4" /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive"  >
                                Delete
                                <DropdownMenuShortcut><Trash2 className="size-4 text-destructive" /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </DynamicForm>

            <Dialog open={isUsernameDialogOpen} onOpenChange={setIsUsernameDialogOpen}>
                <DialogContent className="bg-primary/20 backdrop-blur-sm border-primary text-white rounded-4xl">
                    <DialogHeader>
                        <DialogTitle>Change Username</DialogTitle>
                        <DialogDescription className="text-white/80">
                            {isUsernameCooldownActive
                                ? `You can change your username again in ${usernameCooldownLabel}.`
                                : "Update your public username."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="new-username">New Username</Label>
                        <UsernameInput
                            id="new-username"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            disableCheck={usernameInput.trim() === (user?.username ?? "")}
                            onAvailabilityChange={({ isAvailable, isChecking, hasError }) => {
                                setUsernameAvailable(isAvailable);
                                setIsCheckingUsername(isChecking);
                                setHasUsernameCheckError(hasError);
                            }}
                            placeholder="Enter new username"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUsernameDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmUsernameChange}
                            disabled={
                                isUpdatingProfile ||
                                isCheckingUsername ||
                                !usernameInput.trim() ||
                                (usernameInput.trim() !== (user?.username ?? "") &&
                                    (usernameAvailable !== true || hasUsernameCheckError))
                            }
                        >
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfileForm;
