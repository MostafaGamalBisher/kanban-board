import type { ReactNode } from 'react';
import { EllipsisVertical } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { siteConfig } from '@/config/site';

import { showcase } from './_showcase/content';

/**
 * Design-system showcase for node 1.3. TEMPORARY: replaced by the real
 * board route in node 4.1. Every primitive renders here against the
 * Kanban tokens, so the theme can be reviewed in dark and light.
 */
export default function ShowcasePage() {
  const { sections, forms, overlays, buttons } = showcase;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading-xl">{siteConfig.name}</h1>
        <p className="text-body-l text-muted-foreground">
          {showcase.subheading}
        </p>
      </header>

      <Section title={sections.palette}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {showcase.swatches.map((swatch) => (
            <li key={swatch.name} className="flex flex-col gap-2">
              <span
                className={`h-12 rounded-md border ${swatch.className}`}
                aria-hidden
              />
              <span className="text-body-m text-muted-foreground">
                {swatch.name}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={sections.type}>
        <ul className="flex flex-col gap-3">
          {showcase.typeScale.map((sample) => (
            <li key={sample.name} className={sample.className}>
              {sample.name}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={sections.buttons}>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">{buttons.primaryLarge}</Button>
          <Button size="sm">{buttons.primarySmall}</Button>
          <Button size="sm" variant="secondary">
            {buttons.secondary}
          </Button>
          <Button size="sm" variant="destructive">
            {buttons.destructive}
          </Button>
          <Button size="sm" disabled>
            {buttons.disabled}
          </Button>
        </div>
      </Section>

      <Section title={sections.forms}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-title">{forms.titleLabel}</Label>
            <Input id="demo-title" placeholder={forms.titlePlaceholder} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-invalid">{forms.invalidLabel}</Label>
            <Input id="demo-invalid" aria-invalid />
            <p className="text-body-l text-destructive">{forms.invalidError}</p>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="demo-description">{forms.descriptionLabel}</Label>
            <Textarea
              id="demo-description"
              placeholder={forms.descriptionPlaceholder}
            />
          </div>
          <div className="bg-background flex items-center gap-4 rounded-sm p-3">
            <Checkbox id="demo-subtask" defaultChecked />
            <Label
              htmlFor="demo-subtask"
              className="text-body-m text-muted-foreground line-through"
            >
              {forms.subtask}
            </Label>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="demo-status">{forms.statusLabel}</Label>
            <Select defaultValue={forms.statuses[0].value}>
              <SelectTrigger id="demo-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {forms.statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title={sections.overlays}>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">{overlays.dialogTrigger}</Button>
            </DialogTrigger>
            <DialogContent closeLabel={overlays.closeLabel}>
              <DialogHeader>
                <DialogTitle>{overlays.dialogTitle}</DialogTitle>
                <DialogDescription className="text-body-l">
                  {overlays.dialogDescription}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                {overlays.alertTrigger}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  {overlays.alertTitle}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-body-l">
                  {overlays.alertDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction variant="destructive" className="flex-1">
                  {overlays.alertConfirm}
                </AlertDialogAction>
                <AlertDialogCancel variant="secondary" className="flex-1">
                  {overlays.alertCancel}
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={overlays.menuTrigger}
              >
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem>{overlays.menuEdit}</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                {overlays.menuDelete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card text-card-foreground flex flex-col gap-4 rounded-lg p-6">
      <h2 className="text-heading-s text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
