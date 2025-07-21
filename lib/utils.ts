import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  // Ensure we're working with a Date object
  // This will correctly parse MM/DD/YYYY format strings
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // Format using US locale (month, day, year)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export function exportToCSV(data: any[], filename: string) {
  const csvContent = "data:text/csv;charset=utf-8," 
    + Object.keys(data[0]).join(",") + "\n"
    + data.map(row => Object.values(row).join(",")).join("\n")
  
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}