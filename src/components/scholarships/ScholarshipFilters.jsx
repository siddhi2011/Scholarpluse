import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Search, X, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles 
} from 'lucide-react';
import { EDUCATION_LEVELS, CATEGORIES, CITIZENSHIP_OPTIONS, US_STATES, MAJORS } from '@/lib/educationLevels';
import { cn } from '@/lib/utils';

export default function ScholarshipFilters({ filters, onFilterChange, onClear, totalResults, onAISearch }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  const activeFilterCount = [
    filters.educationLevel, filters.category, filters.citizenship,
    filters.state, filters.major, filters.gender, filters.essay_required,
    filters.renewable, filters.minAmount
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* AI Search bar */}
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        <Input
          placeholder='AI Search: e.g. "STEM scholarships for women in California with no essay"'
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && aiQuery.trim()) { onAISearch?.(aiQuery); } }}
          className="pl-10 h-12 rounded-xl border-0 shadow-sm bg-card text-sm"
        />
        {aiQuery && (
          <Button
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 gap-1 text-xs"
            onClick={() => { onAISearch?.(aiQuery); }}
          >
            <Sparkles className="h-3 w-3" /> Search
          </Button>
        )}
      </div>

      {/* Regular search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, provider, major..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10 h-10 rounded-xl border-0 shadow-sm bg-card text-sm"
        />
        {filters.search && (
          <button onClick={() => onFilterChange({ ...filters, search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Quick filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.educationLevel || 'all'} onValueChange={(v) => onFilterChange({ ...filters, educationLevel: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-40 h-9 rounded-xl border-0 shadow-sm bg-card text-sm">
            <SelectValue placeholder="Grade Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {EDUCATION_LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.longLabel}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.category || 'all'} onValueChange={(v) => onFilterChange({ ...filters, category: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-40 h-9 rounded-xl border-0 shadow-sm bg-card text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.sort || 'deadline'} onValueChange={(v) => onFilterChange({ ...filters, sort: v })}>
          <SelectTrigger className="w-36 h-9 rounded-xl border-0 shadow-sm bg-card text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Soonest</SelectItem>
            <SelectItem value="amount_high">$ Highest</SelectItem>
            <SelectItem value="amount_low">$ Lowest</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="match">Best Match</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showAdvanced ? "secondary" : "outline"}
          size="sm"
          className={cn("h-9 gap-1.5 rounded-xl border-0 shadow-sm", showAdvanced && "bg-primary/10 text-primary")}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="h-4 w-4 p-0 text-xs flex items-center justify-center bg-primary text-white rounded-full ml-0.5">{activeFilterCount}</Badge>
          )}
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {(filters.search || activeFilterCount > 0) && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-9 text-muted-foreground gap-1">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}

        {totalResults != null && (
          <span className="text-sm text-muted-foreground ml-auto">{totalResults} results</span>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-card rounded-xl shadow-sm border-0 animate-fade-in-up">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Citizenship</label>
            <Select value={filters.citizenship || 'all'} onValueChange={(v) => onFilterChange({ ...filters, citizenship: v === 'all' ? '' : v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Status</SelectItem>
                <SelectItem value="us_citizen">U.S. Citizen</SelectItem>
                <SelectItem value="permanent_resident">Permanent Resident</SelectItem>
                <SelectItem value="visa_holder">Visa Holder (F-1, H-1B, etc.)</SelectItem>
                <SelectItem value="daca">DACA Recipient</SelectItem>
                <SelectItem value="international">International Student</SelectItem>
                <SelectItem value="any">Open to All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">State</label>
            <Select value={filters.state || 'all'} onValueChange={(v) => onFilterChange({ ...filters, state: v === 'all' ? '' : v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any State" /></SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All States</SelectItem>
                {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Major / Field</label>
            <Select value={filters.major || 'all'} onValueChange={(v) => onFilterChange({ ...filters, major: v === 'all' ? '' : v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any Major" /></SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">Any Major</SelectItem>
                {MAJORS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gender</label>
            <Select value={filters.gender || 'all'} onValueChange={(v) => onFilterChange({ ...filters, gender: v === 'all' ? '' : v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="any">All Genders</SelectItem>
                <SelectItem value="female">Women Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Min Amount: {filters.minAmount ? `$${Number(filters.minAmount).toLocaleString()}` : 'Any'}
            </label>
            <Slider
              min={0} max={50000} step={500}
              value={[filters.minAmount || 0]}
              onValueChange={([v]) => onFilterChange({ ...filters, minAmount: v || 0 })}
              className="mt-2"
            />
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={!!filters.essay_required}
                onChange={e => onFilterChange({ ...filters, essay_required: e.target.checked ? 'no' : '' })}
                className="rounded"
              />
              No Essay Required
            </label>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={!!filters.renewable}
                onChange={e => onFilterChange({ ...filters, renewable: e.target.checked ? 'yes' : '' })}
                className="rounded"
              />
              Renewable Only
            </label>
          </div>
        </div>
      )}
    </div>
  );
}