'use client';

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // For the prototype, we use a single hardcoded password for all test users
        const password = "Password123!";

        let { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        // If user doesn't exist, auto-signup for the prototype flow
        if (signInError && signInError.message.includes('Invalid login credentials')) {
            // Call our admin API to create the user and force email_confirm: true
            const res = await fetch('/api/auth/prototype-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.error || "Failed to auto-create user.");
                setLoading(false);
                return;
            }

            // Now that they are created and confirmed, sign them in!
            const { error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (retryError) {
                setError(retryError.message);
                setLoading(false);
                return;
            }
        } else if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        router.push("/availability");
    };

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-center mb-8">
                    <Image src="/fenz-logo.svg" alt="FENZ Logo" width={160} height={40} priority />
                </div>
                
                <h1 className="text-xl font-black text-center text-slate-900 uppercase tracking-tighter mb-2">Welcome Back</h1>
                <p className="text-center text-sm font-medium text-slate-500 mb-8">Enter your FENZ email to access your roster.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium outline-none focus:border-[#005DAC] focus:ring-1 focus:ring-[#005DAC] transition-all"
                            placeholder="firstname.lastname@fireandemergency.nz"
                        />
                    </div>
                    
                    {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#005DAC] hover:bg-[#004a8c] text-white font-bold h-12 mt-4 shadow-sm">
                        {loading ? "Authenticating..." : "Login via FENZ SSO"}
                    </Button>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prototype Authentication</p>
                </div>
            </div>
        </main>
    );
}
