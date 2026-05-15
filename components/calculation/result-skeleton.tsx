"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CalculationResultSkeleton() {
  return (
    <div className="relative animate-pulse">
      {/* Soft glow placeholder */}
      <div className="pointer-events-none absolute inset-x-6 top-10 h-72 rounded-3xl bg-gray-200/20 blur-3xl dark:bg-gray-800/15" />

      <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl shadow-gray-200/10 dark:border-gray-800/40 dark:bg-gray-900 sm:p-6">
        {/* Window chrome */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Summary panel */}
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 sm:p-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Timeline placeholder */}
        <div className="mt-8 flex items-center justify-between px-2">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-800 mx-4" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Hero result strip */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/40">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/40">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-8 w-40" />
          </div>
        </div>

        {/* Action panel placeholder */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800">
          <div className="flex justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
