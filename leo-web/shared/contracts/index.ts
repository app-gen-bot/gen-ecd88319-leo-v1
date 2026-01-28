import { initContract } from '@ts-rest/core';
import { generationsContract } from './generations.contract';
import { iterationsContract } from './iterations.contract';
import { appsContract } from './apps.contract';
import { feedbackContract } from './feedback.contract';

const c = initContract();

export const contract = c.router({
  generations: generationsContract,
  iterations: iterationsContract,
  apps: appsContract,
  feedback: feedbackContract,
});
