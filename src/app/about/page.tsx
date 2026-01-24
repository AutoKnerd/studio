
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BarChart, Bot, BrainCircuit, Users, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center text-center text-white bg-slate-900">
          <Image
            src="https://picsum.photos/seed/about-hero/1200/800"
            alt="Modern car dashboard"
            fill
            className="absolute inset-0 z-0 object-cover opacity-30"
            data-ai-hint="modern dashboard"
          />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Welcome to AutoDrive
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground mb-8">
              The AI-powered training platform designed to shift your automotive team into high gear.
            </p>
            <Button asChild size="lg">
              <Link href="/register">Get Started Now</Link>
            </Button>
          </div>
        </section>

        {/* What is AutoDrive Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">What is AutoDrive?</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              AutoDrive is a revolutionary training and performance tool for the modern automotive industry. We replace outdated, inconsistent training methods with interactive, AI-driven lessons that adapt to each team member. From sales consultants to service writers, AutoDrive provides personalized coaching, tracks performance with precision, and gives managers the insights they need to build an elite team.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Role-Play</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Engage in realistic customer scenarios with our advanced AI coach. Practice handling objections, building rapport, and closing deals in a safe, supportive environment.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Targeted Skill Improvement</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Our system identifies each user's weakest Customer Experience (CX) traits and automatically recommends lessons to turn those weaknesses into strengths.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <BarChart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Manager Dashboards</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Get a bird's-eye view of your team's performance. Track progress, identify coaching opportunities, and see dealership-wide stats at a glance.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Custom Lesson Creation</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Need to train on a specific process or a new product? Managers can create and assign custom lessons, with or without help from our scenario-generating AI.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Gamified Progression</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Keep your team motivated with XP, levels, and badges. Celebrate milestones and foster a culture of continuous improvement and friendly competition.
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Built for Every Role</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  From the sales floor to the service drive, AutoDrive offers tailored training for Sales Consultants, Service Writers, Parts, F&I, and Managers.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Team's Growth?</h2>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                    Join the growing number of dealerships transforming their training and driving real results with AutoDrive.
                </p>
                <div className="flex justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/register">Sign Up Free</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/login">Sign In</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
