import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import elfVillageBg from '@/assets/elf-village-bg.webp';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) toast.success('Check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? 'Google sign-in failed');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${elfVillageBg})`, backgroundSize: 'cover', backgroundPosition: 'center', imageRendering: 'pixelated' }}
    >
      <div className="mystical-card glow-border rounded-xl p-8 w-full max-w-sm backdrop-blur-md">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Sparkles className="w-6 h-6 text-accent" />
          <h1 className="font-display text-2xl text-gradient">Fantasy Quest Log</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {mode === 'signin' ? 'Sign in to open your diary on any device' : 'Create your account'}
        </p>
        <Button variant="outline" className="w-full mb-4" onClick={google}>Continue with Google</Button>
        <div className="text-center text-xs text-muted-foreground mb-4">or</div>
        <form onSubmit={submit} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === 'signin' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>
        <button
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? "No account yet? Sign up" : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
