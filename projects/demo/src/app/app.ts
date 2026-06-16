import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DEMO_ROUTES } from './app.routes';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly filter = signal('');

  protected readonly routes = computed(() => {
    const q = this.filter().trim().toLowerCase();
    const all = [...DEMO_ROUTES].sort((a, b) => a.title.localeCompare(b.title));
    return q ? all.filter((r) => r.title.toLowerCase().includes(q) || r.path.includes(q)) : all;
  });

  protected readonly count = computed(() => DEMO_ROUTES.length);

  protected onFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
  }
}
