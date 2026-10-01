import { inject, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Service()
export class Message {
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

  public afficher(message: string) {
    this.snackBar.open(message, this.translateService.instant('commun.fermer'), {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
