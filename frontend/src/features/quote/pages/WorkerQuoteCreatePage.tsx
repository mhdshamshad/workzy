import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, MapPin, Phone, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { SERVICE_TYPE } from '@/constants';
import { useBookingDetails } from '@/hooks/useBookingDetails';

import {
  createQuoteSchema,
  QuotePriceSection,
  QuoteSlotPicker,
  QuoteSummarySection,
  useCreateQuote,
  type CreateQuoteFormType,
} from '../index';

export default function WorkerQuoteCreatePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { booking } = useBookingDetails(bookingId);
  const { mutateAsync: createQuote, isPending } = useCreateQuote();

  const {
    user,
    userNote,
    bookingId: bookingNumberId,
    category,
    address,
    serviceId,
  } = booking ?? {};

  const methods = useForm<CreateQuoteFormType>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      bookingId: '',
      dates: [],
      totalPrice: undefined,
      message: '',
    },
  });
  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    if (booking?.id) {
      setValue('bookingId', booking.id);
    }
  }, [booking?.id, setValue]);

  const handleQuoteSubmit = async (data: CreateQuoteFormType) => {
    console.log({ QuoteForm: data });
    if (!bookingId) {
      return;
    }

    const res = await createQuote({
      bookingId,
      dates: data.dates,
      totalPrice: data.totalPrice,
      message: data.message,
    });
    if (res.message) {
      toast.success(res.message);
    }
    navigate(-1);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleQuoteSubmit, errors => {
          console.log('Validation errors:', errors);
        })}
        className="@container px-4 py-6"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label="Go back"
              onClick={() => navigate(-1)}
              iconLeft={<ArrowLeft className="h-4 w-4" />}
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Send Quote</h1>
              <p className="text-xs text-muted-foreground">
                Booking <span className="font-mono">{bookingNumberId}</span> · {category?.name}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="h-3 w-3" />
            {category?.serviceType === SERVICE_TYPE.INSPECTION ? 'Post-Inspection Quote' : 'Quote'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Customer card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-start gap-4">
                <ProfileImage size={40} src={user?.profileImage} name={user?.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user?.name}</p>
                    {user?.phone && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 inline-flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="line-clamp-2">{address?.label}</span>
                  </p>
                </div>
              </div>

              {userNote && (
                <div className="mt-4 rounded-lg border bg-muted/40 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Customer note
                  </div>
                  <p className="text-sm leading-relaxed">{userNote}</p>
                </div>
              )}
            </motion.div>

            <QuoteSlotPicker serviceId={serviceId} />
            <QuotePriceSection />
          </div>

          {/* Right: summary + submit */}
          <QuoteSummarySection booking={booking ?? undefined} isSubmitting={isPending} />
        </div>
      </form>
    </FormProvider>
  );
}
