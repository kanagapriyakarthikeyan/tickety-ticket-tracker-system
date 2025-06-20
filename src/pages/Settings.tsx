
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState({
    name: 'TicketFlow Inc.',
    email: 'support@ticketflow.com',
    phone: '+1 (555) 123-4567',
    contactNumber: '+1 (555) 987-6543',
    address: '123 Business Ave, Suite 100\nTech City, TC 12345',
    website: 'https://ticketflow.com'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    ticketUpdates: true,
    systemAlerts: true
  });

  const handleCompanyInfoSave = () => {
    // Save company info logic here
    toast({
      title: "Settings Saved",
      description: "Company information has been updated successfully.",
    });
  };

  const handleNotificationsSave = () => {
    // Save notifications logic here
    toast({
      title: "Settings Saved",
      description: "Notification preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={companyInfo.contactNumber}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, contactNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                id="companyWebsite"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Textarea
                id="companyAddress"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleCompanyInfoSave} className="w-full md:w-auto">
              Save Company Information
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Button
                  variant={notifications.emailNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifications(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                >
                  {notifications.emailNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Button
                  variant={notifications.pushNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifications(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                >
                  {notifications.pushNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Ticket Updates</h4>
                  <p className="text-sm text-muted-foreground">Get notified when tickets are updated</p>
                </div>
                <Button
                  variant={notifications.ticketUpdates ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifications(prev => ({ ...prev, ticketUpdates: !prev.ticketUpdates }))}
                >
                  {notifications.ticketUpdates ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">System Alerts</h4>
                  <p className="text-sm text-muted-foreground">Important system notifications</p>
                </div>
                <Button
                  variant={notifications.systemAlerts ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifications(prev => ({ ...prev, systemAlerts: !prev.systemAlerts }))}
                >
                  {notifications.systemAlerts ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>

            <Button onClick={handleNotificationsSave} className="w-full md:w-auto">
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
