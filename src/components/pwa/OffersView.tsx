import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sun, Moon, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";

// Standard decline reasons for the firefighter
const DECLINE_REASONS = ["Fatigue", "Personal/Family", "Already Working", "Not Available", "Other"];

export function OffersView({ testEmail }: { testEmail?: string }) {
    const [loading, setLoading] = React.useState(true);
    const [offers, setOffers] = React.useState<any[]>([]);

    // Dialog State
    const [declineDialogOpen, setDeclineDialogOpen] = React.useState(false);
    const [selectedOffer, setSelectedOffer] = React.useState<any>(null);
    const [declineReason, setDeclineReason] = React.useState("");
    const [customReason, setCustomReason] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        fetchMyOffers();
    }, [testEmail, supabase]);

    const fetchMyOffers = async () => {
        setLoading(true);
        let userEmail = testEmail;
        
        if (!userEmail) {
            const { data: { session } } = await supabase.auth.getSession();
            userEmail = session?.user?.email;
        }

        if (!userEmail) return;

        // 2. Find their firefighter ID
        const { data: ff } = await supabase.from('firefighters').select('id').eq('email', userEmail).single();

        if (ff) {
            const { data: myOffers } = await supabase
                .from('ot_offers')
                .select(`
          id, status, deadline, metadata,
          ot_requests ( id, date, shift_type, specialist_type, stations (name, district) )
        `)
                .eq('firefighter_id', ff.id);

            const sortedOffers = (myOffers || []).sort((a: any, b: any) => {
                const dateA = Array.isArray(a.ot_requests) ? a.ot_requests[0]?.date : a.ot_requests?.date;
                const dateB = Array.isArray(b.ot_requests) ? b.ot_requests[0]?.date : b.ot_requests?.date;
                return new Date(dateA || 0).getTime() - new Date(dateB || 0).getTime();
            });

            setOffers(sortedOffers);
        }
        setLoading(false);
    };

    const handleAccept = async (offerId: number) => {
        setIsSubmitting(true);
        try {
            // We will build this endpoint in Phase 3!
            const res = await fetch('/api/offers/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId, action: 'accept' })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await fetchMyOffers();
        } catch (err: any) {
            alert(`Failed to accept: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeclineDialog = (offer: any) => {
        setSelectedOffer(offer);
        setDeclineReason("");
        setCustomReason("");
        setDeclineDialogOpen(true);
    };

    const submitDecline = async () => {
        const finalReason = declineReason === "Other" ? customReason : declineReason;
        if (!finalReason) return alert("Please select a reason.");

        setIsSubmitting(true);
        try {
            // We will build this endpoint in Phase 3!
            const res = await fetch('/api/offers/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId: selectedOffer.id, action: 'decline', reason: finalReason })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setDeclineDialogOpen(false);
            await fetchMyOffers();
        } catch (err: any) {
            alert(`Failed to decline: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const pendingOffers = offers.filter(o => o.status === 'sent');
    const pastOffers = offers.filter(o => o.status !== 'sent');

    return (
        <div className="min-h-full pb-20">
            <div className="p-4 space-y-6 mt-4">
                {/* PENDING OFFERS SECTION */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Pending Offers</h2>
                        {pendingOffers.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs font-black px-2 py-0.5 rounded-full">{pendingOffers.length}</span>
                        )}
                    </div>

                    {loading ? (
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    ) : pendingOffers.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                            <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-gray-500">You have no pending offers.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingOffers.map(offer => {
                                const req = Array.isArray(offer.ot_requests) ? offer.ot_requests[0] : offer.ot_requests;
                                const station = Array.isArray(req.stations) ? req.stations[0] : req.stations;
                                const isDay = req.shift_type === 'Day';

                                return (
                                    <Card key={offer.id} className="p-5 rounded-2xl border-blue-100 shadow-md ring-1 ring-blue-50 bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {isDay ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                                                    <span className="font-black text-gray-900">{new Date(req.date).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5" /> {station?.name} ({station?.district})
                                                </div>
                                            </div>
                                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                {req.shift_type}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 mb-5 p-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 border border-slate-100">
                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                            Expires: {new Date(offer.deadline).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button onClick={() => handleAccept(offer.id)} disabled={isSubmitting} className="w-full rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-sm h-11 text-sm">
                                                {isSubmitting ? "Accepting..." : "Accept Shift"}
                                            </Button>
                                            <Button onClick={() => openDeclineDialog(offer)} className="w-full rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold h-11 text-sm shadow-sm">
                                                Decline
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* HISTORY SECTION */}
                <section>
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-3 px-1">Recent History</h2>
                    <div className="space-y-3">
                        {pastOffers.slice(0, 5).map(offer => {
                            const req = Array.isArray(offer.ot_requests) ? offer.ot_requests[0] : offer.ot_requests;
                            const station = Array.isArray(req.stations) ? req.stations[0] : req.stations;
                            const isAccepted = offer.status === 'accepted';

                            return (
                                <div key={offer.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 opacity-75">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{new Date(req.date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} • {station?.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{req.shift_type}</p>
                                    </div>
                                    {isAccepted ? (
                                        <span className="flex items-center gap-1 text-xs font-black text-green-600"><CheckCircle2 className="w-4 h-4" /> Accepted</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-black text-red-500"><XCircle className="w-4 h-4" /> Declined</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* DECLINE DIALOG */}
            <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
                <DialogContent className="sm:max-w-xs rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900">Decline Shift</DialogTitle>
                        <DialogDescription className="text-xs font-medium">Please let us know why you are declining this offer.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-4">
                        {DECLINE_REASONS.map(reason => (
                            <button
                                key={reason}
                                onClick={() => { setDeclineReason(reason); setCustomReason(""); }}
                                className={`p-3 text-left rounded-xl text-sm font-bold border transition-all ${declineReason === reason ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                {reason}
                            </button>
                        ))}
                        {declineReason === "Other" && (
                            <input
                                type="text"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Type reason here..."
                                className="mt-2 w-full p-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                autoFocus
                            />
                        )}
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button variant="outline" onClick={() => setDeclineDialogOpen(false)} className="rounded-xl flex-1 border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</Button>
                        <Button onClick={submitDecline} disabled={isSubmitting} className="rounded-xl flex-1 bg-[#005DAC] hover:bg-blue-700 text-white font-bold">
                            {isSubmitting ? "Saving..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
