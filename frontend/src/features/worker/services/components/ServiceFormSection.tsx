import { Briefcase, IndianRupee, Info } from 'lucide-react';
import { useEffect } from 'react';

import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import SlotTimeInput from '@/components/molecules/SlotTimeInput';
import type { Category } from '@/types/category';

import { useServiceForm } from '../hooks/useServiceForm';

import BulkDiscountSection from './BulkDiscountSection';

export default function ServiceFormSection({
  form,
  category,
}: {
  form: ReturnType<typeof useServiceForm>;
  category: Category;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const duration = Number(watch('estimatedDuration') ?? 0);
  const buffer = Number(watch('bufferTime') ?? 0);

  const showMaxTravel = !!watch('_setTravelCost');
  useEffect(() => {
    if (!showMaxTravel) {
      setValue('maxTravelCost', null, { shouldValidate: true });
    }
  }, [showMaxTravel, setValue]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Description</Label>
        <Textarea
          {...register('description')}
          placeholder="Describe your service..."
          error={errors.description?.message as string}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Rate (₹)</Label>
          <Input
            leftIcon={<IndianRupee size={17} />}
            type="number"
            error={errors.rate?.message as string}
            {...register('rate')}
          />
        </div>

        <div>
          <Label>Experience (years)</Label>
          <Input
            leftIcon={<Briefcase size={17} />}
            type="number"
            error={errors.experience?.message as string}
            {...register('experience')}
          />
        </div>
        <SlotTimeInput
          label="Duration *"
          valueInMinutes={duration}
          onChange={v =>
            setValue('estimatedDuration', v, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          error={errors.estimatedDuration?.message}
        />

        <SlotTimeInput
          label="Buffer Time"
          valueInMinutes={buffer}
          onChange={v =>
            setValue('bufferTime', v, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          isBuffer
          error={errors.bufferTime?.message}
        />
      </div>

      <div className="space-y-3">
        {category.allowBulkOffers && <BulkDiscountSection form={form} />}

        {category.allowSuddenBooking && (
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Allow Sudden Booking</p>
              <p className="text-xs text-muted-foreground">Customers can book instantly</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('allowSuddenBooking')} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        )}

        {category.travelRatePerKM && category.travelRatePerKM > 0 && (
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Limit Maximum Travel Cost</p>
              <p className="text-xs text-muted-foreground">Set a maximum cap on travel charges.</p>

              <div className="flex items-start gap-2 text-xs text-amber-600 dark:bg-card bg-amber-50 border border-amber-200 rounded-md p-2">
                <Info className="w-3.5 h-3.5 mt-0.5" />
                <span>
                  If the actual travel cost exceeds this cap, you will only receive the capped
                  amount.
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('_setTravelCost')} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Travel Radius (km)</Label>
            <Input
              type="number"
              className="pl-3"
              error={errors.maxTravelRadius?.message}
              {...register('maxTravelRadius')}
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <Info size={10} /> You earn ₹{category.travelRatePerKM}/km
            </p>
          </div>

          {showMaxTravel && (
            <div>
              <Label>Max Travel Cost Cap (₹)</Label>
              <Input
                leftIcon={<IndianRupee size={17} />}
                type="number"
                error={errors.maxTravelCost?.message}
                {...register('maxTravelCost', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
