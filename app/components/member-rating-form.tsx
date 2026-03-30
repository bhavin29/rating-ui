'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button } from '@/app/components/ui';
import { QuestionList } from '@/app/components/question-list';
import { useSubmitRating } from '@/app/hooks/use-submit-rating';

const formSchema = z.object({
  ratings: z.record(z.record(z.number().min(1).max(7)))
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  token: string;
  members: Array<{ id: string; name: string; role: string }>;
  questionsByRole: Array<{ role: string; questions: Array<{ id: string; text: string }> }>;
};

export function MemberRatingForm({ token, members, questionsByRole }: Props) {
  const [success, setSuccess] = useState(false);
  const mutation = useSubmitRating(token);
  const roleQuestions = useMemo(
    () => Object.fromEntries(questionsByRole.map((g) => [g.role, g.questions])),
    [questionsByRole]
  );

  const { watch, setValue, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ratings: {} }
  });

  const ratings = watch('ratings');

  const isComplete = members.every((member) =>
    (roleQuestions[member.role] ?? []).every((q) => ratings?.[member.id]?.[q.id] >= 1)
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!isComplete || mutation.isPending) return;
    const payload = {
      ratings: members.map((member) => ({
        memberId: member.id,
        answers: (roleQuestions[member.role] ?? []).map((q) => ({
          questionId: q.id,
          score: values.ratings[member.id][q.id]
        }))
      }))
    };
    await mutation.mutateAsync(payload);
    setSuccess(true);
  });

  if (success) {
    return <Card className="text-center text-green-700">Your ratings were submitted successfully.</Card>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {members.map((member) => (
        <Card key={member.id} className="space-y-3">
          <div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-xs uppercase text-slate-500">{member.role}</p>
          </div>
          <QuestionList
            questions={roleQuestions[member.role] ?? []}
            values={ratings?.[member.id] ?? {}}
            onChange={(questionId, score) => setValue(`ratings.${member.id}.${questionId}`, score, { shouldValidate: true })}
          />
        </Card>
      ))}
      {mutation.isError ? <p className="text-sm text-red-600">Failed to submit rating. Please retry.</p> : null}
      <Button type="submit" disabled={!isComplete || mutation.isPending}>
        {mutation.isPending ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </form>
  );
}
