import { type FormEvent, useState } from "react";
import { useProfile, useUpdateProfile, useResetPassword } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ProfilePage() {
    const { data: profile, isLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const resetPassword = useResetPassword();
    const [password, setPassword] = useState("");

    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            await updateProfile.mutateAsync({
                name: fd.get("name") as string,
                phone: fd.get("phone") as string,
            });
            toast.success("Profile updated");
        } catch {
            toast.error("Failed to update profile");
        }
    };

    const handlePasswordReset = async (e: FormEvent) => {
        e.preventDefault();
        if (!password || password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        try {
            await resetPassword.mutateAsync(password);
            toast.success("Password changed");
            setPassword("");
        } catch {
            toast.error("Failed to change password");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your account</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profile?.email ?? ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={profile?.role ?? ""} disabled className="capitalize" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={profile?.name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={profile?.phone}
                            />
                        </div>
                        <Button type="submit" disabled={updateProfile.isPending}>
                            {updateProfile.isPending ? "Saving…" : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={resetPassword.isPending}>
                            {resetPassword.isPending ? "Changing…" : "Change Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
