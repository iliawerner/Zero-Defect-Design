import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Header } from '../../components/Header';
import { ChatList } from '../../components/ChatList';
import { authOptions } from '../../lib/auth-options';
import { EvaluationForm } from '../../components/EvaluationForm';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '32px 0 64px', display: 'grid', gap: '32px' }}>
        <section className="card">
          <h2 className="section-title">Новая оценка</h2>
          <EvaluationForm />
        </section>
        <section className="card">
          <h2 className="section-title">История оценок</h2>
          <ChatList />
        </section>
      </main>
    </>
  );
}
