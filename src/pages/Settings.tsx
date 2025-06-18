
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Bell, Database, User } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'TicketFlow Inc.',
    supportEmail: 'support@ticketflow.com',
    autoAssignTickets: true,
    emailNotifications: true,
    slackIntegration: false,
  });
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your settings have been successfully updated.",
    });
  };

  const handleClearData = () => {
    localStorage.removeItem('tickets');
    localStorage.removeItem('customers');
    toast({
      title: "Data Cleared",
      description: "All tickets and customer data have been removed.",
      variant: "destructive",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your ticket management system</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Update your company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => updateSetting('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you want to be notified about ticket updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for new tickets and updates
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-assign Tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign new tickets to available agents
                </p>
              </div>
              <Switch
                checked={settings.autoAssignTickets}
                onCheckedChange={(checked) => updateSetting('autoAssignTickets', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Slack Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Send ticket notifications to Slack channels
                </p>
              </div>
              <Switch
                checked={settings.slackIntegration}
                onCheckedChange={(checked) => updateSetting('slackIntegration', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your application data and storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h4 className="font-medium text-yellow-800 mb-2">Database Integration</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Currently using local storage. For production use, connect to Supabase for proper database functionality.
              </p>
              <Button variant="outline" size="sm">
                Connect to Supabase
              </Button>
            </div>
            
            <Separator />
            
            <div className="p-4 border rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Clear All Data</h4>
              <p className="text-sm text-red-700 mb-3">
                This will permanently delete all tickets and customer data. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm" onClick={handleClearData}>
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
