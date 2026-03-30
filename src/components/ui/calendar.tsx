"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3", // Removed bg-primary/30 to let popover glass effect show
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between pointer-events-none", // Allow clicks to pass through spacer
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-foreground pointer-events-auto", // Enable clicks on buttons
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-foreground pointer-events-auto", // Enable clicks on buttons
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-9 w-full text-white font-semibold italic tracking-tight",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-9 gap-1.5 relative z-10",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative flex items-center bg-white/5 rounded-lg px-2 border border-white/10",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "appearance-none bg-transparent border-none p-1 text-xs font-semibold cursor-pointer text-white/90 hover:bg-white/5 rounded-md focus:outline-hidden",
          "rdp-dropdown_month-year",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "text-sm font-medium text-white",
          captionLayout === "label"
            ? "text-sm"
            : "hidden",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse space-y-1",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-white/80  rounded-md w-10 font-normal text-[0.8rem] uppercase",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2 gap-1", defaultClassNames.week),
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-primary/30 hover:text-white rounded-lg transition-all",
          defaultClassNames.day
        ),
        range_end: "day-range-end",
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-accent-hover hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          defaultClassNames.selected
        ),
        today: cn(
          "bg-white/10 text-primary font-bold border border-primary/30",
          defaultClassNames.today
        ),
        outside: cn(
          "day-outside text-muted-foreground/20 opacity-30",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground/10 opacity-20",
          defaultClassNames.disabled
        ),
        range_middle: cn(
          "aria-selected:bg-primary/10 aria-selected:text-primary",
          defaultClassNames.range_middle
        ),
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-white data-[range-middle=true]:bg-primary/10 data-[range-middle=true]:text-primary data-[range-start=true]:bg-primary data-[range-start=true]:text-white data-[range-end=true]:bg-primary data-[range-end=true]:text-white group-data-[focused=true]/day:border-primary/50 group-data-[focused=true]/day:ring-primary/20 hover:bg-primary/20 hover:text-white dark:hover:text-white flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-lg data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-lg [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
