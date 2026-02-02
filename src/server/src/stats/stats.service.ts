import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class StatsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getStats(pageId?: string) {
    return this.firebaseService.getStats(pageId);
  }
}