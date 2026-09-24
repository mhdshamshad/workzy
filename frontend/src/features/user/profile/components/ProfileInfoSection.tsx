import { zodResolver } from '@hookform/resolvers/zod';
import { Check, MapPin, Pencil, Phone, Save, User2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Select from '@/components/atoms/Select';
import { Separator } from '@/components/ui/separator';
import { INDIAN_STATES } from '@/constants';
import type { User } from '@/types/user';

import MapSelector from '../../../profile/components/MapSelector';
import {
  ProfileSchema,
  type ProfileFormType,
} from '../../../user/profile/validation/profileSchema';

interface Props {
  user: User;
  onSubmit: (data: ProfileFormType) => Promise<string>;
}

export default function ProfileInfoSection({ user, onSubmit }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [locationMapOpen, setLocationMapOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: user as unknown as ProfileFormType,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    reset(user as unknown as ProfileFormType);
  }, [reset, user]);

  const handleFormSubmit = async (data: ProfileFormType) => {
    const message = await onSubmit(data);
    if (message) {
      setEditMode(false);
      setLocationMapOpen(false);
      toast.success(message);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setLocationMapOpen(false);
    reset(user as unknown as ProfileFormType);
  };

  return (
    <div className="bg-card border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Profile Information</h3>
        <div>
          {!editMode ? (
            <Button
              iconRight={<Pencil size={18} />}
              variant="blue"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                disabled={isSubmitting}
                iconRight={<X size={18} />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="green"
                iconRight={<Save size={19} />}
                loading={isSubmitting}
                disabled={!isDirty || isSubmitting}
                onClick={handleSubmit(handleFormSubmit)}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User2 className="w-4 h-4 text-indigo-600" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                leftIcon={<User2 size={15} />}
                placeholder="Enter full Name"
                disabled={!editMode}
                error={errors.name?.message}
                {...register('name', { setValueAs: v => v.trim() })}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                leftIcon={<Phone size={15} />}
                value={user.phone ? user.phone : 'Phone Number not provided'}
                disabled
                readOnly
              />
            </div>
          </div>
        </div>

        <Separator className="mb-3" />

        <div className="pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Location Information
          </h4>
          <Controller
            name="profile"
            control={control}
            render={({ field }) => (
              <>
                <div className="space-y-4">
                  <div>
                    <Label>Address</Label>
                    <Input
                      disabled={!editMode}
                      placeholder="Street address, apartment, suite"
                      className="px-3"
                      {...register('profile.address.house', { setValueAs: v => v.trim() })}
                      error={errors.profile?.address?.house?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Place</Label>
                      <Input
                        disabled={!editMode}
                        placeholder="Enter your place"
                        className="px-3"
                        {...register('profile.address.place', { setValueAs: v => v.trim() })}
                        error={errors.profile?.address?.place?.message}
                      />
                    </div>

                    <div>
                      <Label>City</Label>
                      <Input
                        disabled={!editMode}
                        placeholder="Enter your city"
                        className="px-3"
                        {...register('profile.address.city', { setValueAs: v => v.trim() })}
                        error={errors.profile?.address?.city?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>State</Label>
                      {editMode ? (
                        <Select
                          placeholder="Select State"
                          leftIcon={<MapPin size={15} />}
                          options={INDIAN_STATES.map(s => ({ label: s, value: s }))}
                          value={watch('profile.address.state')}
                          onChange={v => setValue('profile.address.state', v)}
                          error={errors.profile?.address?.state?.message}
                        />
                      ) : (
                        <Input
                          disabled
                          placeholder={user.profile?.address?.state || 'Not Provided'}
                          className="px-3"
                        />
                      )}
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input
                        disabled={!editMode}
                        placeholder="Enter Pincode"
                        className="px-3"
                        {...register('profile.address.pincode')}
                        error={errors.profile?.address?.pincode?.message}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-linear-to-r from-accent/20 to-primary/20 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-foreground text-sm">GPS Coordinates</h5>
                          {field.value?.location && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <Check className="w-3 h-3" />
                              Set
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {field.value?.location
                            ? 'Your precise location has been saved for better service delivery.'
                            : 'Set your GPS coordinates for accurate location-based services.'}
                        </p>
                        {editMode && (
                          <button
                            type="button"
                            className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            onClick={() => setLocationMapOpen(true)}
                          >
                            {field.value?.location ? 'Update Location' : 'Set Location'} →
                          </button>
                        )}
                        {field.value?.location?.coordinates && (
                          <div className="mt-2 p-2 bg-background rounded text-xs font-mono">
                            Lat: {field.value?.location?.coordinates[1].toFixed(4)}, Lng:{' '}
                            {field.value?.location?.coordinates[0].toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {locationMapOpen && (
                  <MapSelector
                    onLocationSelect={(coords, address) => {
                      setValue('profile.address.house', address?.house || '');
                      setValue('profile.address.place', address?.place || '');
                      setValue('profile.address.city', address?.city || '');
                      setValue('profile.address.state', address?.state || '');
                      setValue('profile.address.pincode', address?.pincode || '');
                      setValue('profile.location', {
                        type: 'Point',
                        coordinates: coords,
                      });
                    }}
                    onClose={() => setLocationMapOpen(false)}
                  />
                )}
              </>
            )}
          ></Controller>
        </div>
      </form>
    </div>
  );
}
