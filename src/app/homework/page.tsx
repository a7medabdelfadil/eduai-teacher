/* eslint-disable @next/next/no-img-element */
"use client";
import Container from "~/_components/Container";
import * as React from "react";
import { useState } from "react";
import { Calendar } from "~/components/ui/calendar";
import { Text } from "~/_components/Text";
import { useAddHomeWork, useGetAllHomeWorks } from "~/APIs/hooks/useHomeWork";
import { useGetAllRealSession } from "~/APIs/hooks/useSchedule";
import { format, isSameDay } from "date-fns";
import Spinner from "~/_components/Spinner";
import type { Homework, HomeWorkFormData } from "~/types";
import Modal from "~/_components/Modal";
import Input from "~/_components/Input";
import SearchableSelect from "~/_components/SearchSelect";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import Button from "~/_components/Button";
import useLanguageStore from "~/APIs/store";

function CalendarDemo({
  onDateSelect,
}: {
  onDateSelect: (date: Date) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onDateSelect(newDate);
    }
  };
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleDateSelect}
      className="flex w-fit justify-center rounded-md max-[1080px]:w-full"
    />
  );
}

const Homework = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedSessionId, setSelectedSessionId] = React.useState<
    number | null
  >(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const { mutate, isPending: isSubmitting } = useAddHomeWork();

  const language = useLanguageStore((state) => state.language);
  const translate = (en: string, fr: string, ar: string) => {
    return language === "fr" ? fr : language === "ar" ? ar : en;
  };
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<HomeWorkFormData>();

  const deadlineValue = watch("deadline");
  const isDateMismatch = React.useMemo(() => {
    if (!deadlineValue) return false;
    const deadlineDate = new Date(deadlineValue);
    return !isSameDay(deadlineDate, selectedDate);
  }, [deadlineValue, selectedDate]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    reset();
  };
  
  function formatDateTimeBeautifully(dateString: string): string {
    const date = new Date(dateString);

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${dayName}, ${monthName} ${dayOfMonth}, ${year} at ${hours}:${formattedMinutes} ${ampm}`;
  }
  
  const formattedDate = React.useMemo(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate],
  );

  const { data: RealSessions, refetch, isLoading: isRealSessions } =
  useGetAllRealSession(formattedDate);
  const sessionsOptions =
    RealSessions?.data?.map((session: any) => ({
      value: session.sessionId,
      label: `${session.courseName} - ${session.date}, ${session.classroomCode}, ${session.endTime}`,
    })) ?? [];
  const { data: homeworks, isLoading: isHomework, refetch: refetchHomework } = useGetAllHomeWorks(
    selectedSessionId ?? 0,
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSessionId(null);
  };

  const handleSessionSelect = (sessionId: number) => {
    setSelectedSessionId(sessionId);
  };

  const onSubmit = (data: HomeWorkFormData) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("HomeWork submitted successfully!");
        void refetchHomework();
        handleCloseModal();
      },
      onError: (
        err: Error & { response?: { data: { message: string; data: [] } } },
      ) => {
        if (err.response?.data) {
          toast.error(err.response.data.message);
        } else {
          toast.error(err.message);
        }
      },
    });
  };

  return (
    <>
      <Container>
        <div className="mb-4 flex w-full gap-10 max-[1080px]:grid">
          <div className="flex h-fit">
            <CalendarDemo onDateSelect={handleDateSelect} />
          </div>

          <div className="grid w-full gap-2 rounded-md bg-bgPrimary p-4">
            <div className="flex w-full items-start justify-between">
            <Text font={"bold"} size={"2xl"}>
                {translate("Homework", "Devoir", "الواجب")}
              </Text>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 font-medium text-primary"
              >
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>{" "}
                {translate("Add Homework", "Ajouter un devoir", "إضافة واجب")}
              </button>
            </div>

            {/* Sessions List */}
            {isRealSessions ? (
              <div className="flex w-full justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                {RealSessions?.data && (
                  <div className="mb-4">
                    <Text className="mb-2">{translate("Select a Session:", "Sélectionnez une session :", "اختر جلسة:")}</Text>
                    <div className="flex flex-wrap gap-2">
                      {RealSessions.data.map((session: any) => (
                        <button
                          key={session.sessionId}
                          onClick={() => handleSessionSelect(session.sessionId)}
                          className={`rounded-md px-3 py-1 ${
                            selectedSessionId === session.sessionId
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          {session.courseName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Homework List */}
            {isHomework && selectedSessionId ? (
              <div className="flex w-full justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="grid h-full items-start">
                {homeworks?.data?.content && homeworks.data.content.length > 0 ? (
                  homeworks?.data.content.map((homework: Homework) => (
                    <div
                      key={homework.id}
                      className="mb-2 rounded-md border border-borderPrimary p-4"
                    >
                      <div className="grid h-full gap-2 border-l-4 border-primary px-3">
                        <div className="flex items-start justify-between">
                          <Text font="bold" size="xl">
                            {homework.title}
                          </Text>
                        </div>
                        <div>
                          <Text color="error" font="medium">
                          {translate("Deadline:", "Date limite :", "الموعد النهائي:")}
                            {formatDateTimeBeautifully(homework.deadline)}
                          </Text>
                          <Text color="gray">{homework.description}</Text>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    {translate("No homework found for the selected session", "Aucun devoir trouvé pour la session sélectionnée", "لا يوجد واجب للجلسة المحددة")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div>
          <Text font="bold" size="xl" className="mb-5">
            {" "}
            {translate("Add Homework", "Ajouter un devoir", "إضافة واجب")}
          </Text>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full gap-3 px-4">
            <label htmlFor="title" className="block">
              <Input
                error={errors.title?.message?.toString() ?? ""}
                {...register("title", { required: translate("Title is required", "Le titre est requis", "العنوان مطلوب") })}
              placeholder={translate("Title", "Titre", "العنوان")}
                theme="transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message?.toString()}
                </p>
              )}
            </label>
            <label htmlFor="deadline" className="block">
              {isDateMismatch && (
                <Text color="error">
                  You should make the same day that you were select it from calendar!
                </Text>
              )}
              <Input
                error={errors.deadline?.message?.toString() ?? ""}
                {...register("deadline", { required: translate("Deadline is required", "La date limite est requise", "الموعد النهائي مطلوب") })}
              type="datetime-local"
              placeholder={translate("Deadline", "Date limite", "الموعد النهائي")}
                theme="transparent"
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.deadline.message?.toString()}
                </p>
              )}
            </label>
            <label htmlFor="description" className="block">
              <Input
                error={errors.description?.message?.toString() ?? ""}
                {...register("description", { required: translate("Description is required", "La description est requise", "الوصف مطلوب") })}
              placeholder={translate("Description", "Description", "الوصف")}
                theme="transparent"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message?.toString()}
                </p>
              )}
            </label>
            <Controller
              name="sessionId"
              control={control}
              rules={{ required: translate("Session selection is required", "La sélection de la session est requise", "اختيار الجلسة مطلوب") }}
              defaultValue=""
              render={({ field }) => (
                <SearchableSelect {...field} placeholder={translate("Select Session", "Sélectionnez une session", "اختر جلسة")} options={sessionsOptions} />
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? translate("Adding Homework...", "Ajout de devoir...", "جاري إضافة الواجب...") : translate("Add Homework", "Ajouter un devoir", "إضافة واجب")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Homework;