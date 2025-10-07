import { Header } from '../../components/Header';
import { ChatList } from '../../components/ChatList';
import { EvaluationForm } from '../../components/EvaluationForm';

export default function DashboardPage() {
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
