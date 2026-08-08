import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { BaseLookupItem } from "../../shared/types";

type BaseSelectProps = {
  data: BaseLookupItem[];
  value?: string;
  classNames?: string;
  onChange?: (value: string) => void;
};

export default function BaseSelect({
  data,
  value,
  classNames,
  onChange,
}: BaseSelectProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          className={clsx(
            "flex justify-between items-center bg-surface/45 hover:bg-surface/70 shadow-sm backdrop-blur-md px-2.5 py-1.5 border border-primary/35 focus:border-secondary/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 w-full text-on-primary text-xs font-semibold text-left transition-all cursor-pointer",
            classNames ? classNames : "",
          )}
        >
          <Select.Value placeholder={t("desktop.common.chooseOption")} />
          <Select.Icon className="text-on-accent">
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="z-50 bg-surface/95 shadow-2xl shadow-black/30 backdrop-blur-xl border border-primary/35 rounded-lg overflow-hidden min-w-[var(--radix-select-trigger-width)]"
            position="popper"
            sideOffset={5}
          >
            <Select.Viewport className="p-1">
              {data.map((item) => (
                <BaseSelectItem key={item.value} value={item.value}>
                  {item.label}
                </BaseSelectItem>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

type SelectItemProps = {
  children: React.ReactNode;
  value: string;
  className?: string;
};

const BaseSelectItem = React.forwardRef<
  React.ComponentRef<typeof Select.Item>,
  SelectItemProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <Select.Item
      {...props}
      ref={forwardedRef}
      className="flex justify-between items-center data-[highlighted]:bg-primary/70 px-3 py-2 rounded-md outline-none text-on-primary data-[disabled]:text-on-primary/40 data-[highlighted]:text-on-primary text-sm transition-colors cursor-pointer data-[disabled]:pointer-events-none select-none"
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator>
        <Check size={18} />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

BaseSelectItem.displayName = "BaseSelectItem";
