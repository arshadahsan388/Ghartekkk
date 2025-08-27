'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Home, PlusCircle, Trash2 } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="font-headline text-4xl sm:text-5xl font-bold">My Account</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-6 h-6" />
              Delivery Address
            </CardTitle>
            <CardDescription>Manage your saved delivery address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address-line-1">Address Line 1</Label>
                <Input id="address-line-1" placeholder="e.g., House 123, Street 4" defaultValue="House 123, Street 4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-line-2">Address Line 2 (Optional)</Label>
                <Input id="address-line-2" placeholder="e.g., Block C, Gulberg 3" defaultValue="Block C, Gulberg 3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="e.g., Lahore" defaultValue="Lahore" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input id="postal-code" placeholder="e.g., 54000" defaultValue="54000" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button>Save Address</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Payment Methods
            </CardTitle>
            <CardDescription>Add and manage your credit/debit cards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-2 rounded-md">
                   <CreditCard className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">Visa ending in 1234</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-destructive" />
                <span className="sr-only">Remove card</span>
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Card
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
