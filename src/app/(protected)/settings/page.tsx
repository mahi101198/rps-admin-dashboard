import { AppSettings } from '@/lib/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsForm } from './settings-form';
import { SettingsContent } from './settings-content';

export default function SettingsPage() {
  return <SettingsContent />;
}