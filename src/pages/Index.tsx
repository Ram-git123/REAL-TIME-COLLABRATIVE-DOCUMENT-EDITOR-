import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Edit3, Users, History, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.jpg';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="CrispScribe Logo" 
              className="h-10 w-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
            <span className="text-2xl font-bold text-foreground">CrispScribe</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')} className="hover:scale-105 transition-transform">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="hover:scale-105 transition-transform shadow-lg shadow-primary/25">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <div className="mb-8 animate-fade-in">
            <img 
              src={logo} 
              alt="CrispScribe Logo" 
              className="h-24 w-24 mx-auto rounded-2xl shadow-2xl shadow-primary/30 object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Write beautifully.
            <br />
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Together.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A clean, focused document editor with real-time collaboration, 
            version history, and seamless Word import.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="animate-fade-in shadow-xl shadow-primary/30 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
            style={{ animationDelay: '0.3s' }}
          >
            <Edit3 className="h-5 w-5 mr-2" />
            Start Writing
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything you need to write
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Edit3, title: 'Rich Text Editor', desc: 'Full formatting with fonts, sizes, headings, lists, and alignment options.', delay: 0 },
              { icon: Users, title: 'Real-Time Sync', desc: 'Your changes sync instantly across all devices and sessions.', delay: 0.1 },
              { icon: History, title: 'Version History', desc: 'Take snapshots and restore previous versions anytime.', delay: 0.2 },
            ].map((feature, i) => (
              <div 
                key={i}
                className="text-center p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logo} alt="CrispScribe" className="h-6 w-6 rounded-full object-cover" />
            <span className="font-semibold text-foreground">CrispScribe</span>
          </div>
          <p className="text-sm">Write beautifully. Together.</p>
        </div>
      </footer>
    </div>
  );
}
