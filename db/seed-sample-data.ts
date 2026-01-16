import 'dotenv/config';
import { db } from './index';
import { exerciseCategories, exercises, workouts, workoutExercises, sets } from './schema';

const USER_ID = 'user_38Hchry4CduEsltEblLq5ONwnMU';

// UUIDs for referential integrity
const categoryIds = {
  chest: 'a1b2c3d4-1111-4000-8000-000000000001',
  back: 'a1b2c3d4-1111-4000-8000-000000000002',
  legs: 'a1b2c3d4-1111-4000-8000-000000000003',
  shoulders: 'a1b2c3d4-1111-4000-8000-000000000004',
  arms: 'a1b2c3d4-1111-4000-8000-000000000005',
};

const exerciseIds = {
  benchPress: 'b2c3d4e5-2222-4000-8000-000000000001',
  inclineDbPress: 'b2c3d4e5-2222-4000-8000-000000000002',
  barbellRow: 'b2c3d4e5-2222-4000-8000-000000000003',
  pullUps: 'b2c3d4e5-2222-4000-8000-000000000004',
  squat: 'b2c3d4e5-2222-4000-8000-000000000005',
  romanianDeadlift: 'b2c3d4e5-2222-4000-8000-000000000006',
};

const workoutIds = {
  pushDay: 'c3d4e5f6-3333-4000-8000-000000000001',
  pullDay: 'c3d4e5f6-3333-4000-8000-000000000002',
  legDay: 'c3d4e5f6-3333-4000-8000-000000000003',
};

const workoutExerciseIds = {
  pushBench: 'd4e5f6a7-4444-4000-8000-000000000001',
  pushIncline: 'd4e5f6a7-4444-4000-8000-000000000002',
  pullRow: 'd4e5f6a7-4444-4000-8000-000000000003',
  pullPullUps: 'd4e5f6a7-4444-4000-8000-000000000004',
  legSquat: 'd4e5f6a7-4444-4000-8000-000000000005',
  legRdl: 'd4e5f6a7-4444-4000-8000-000000000006',
};

async function main() {
  console.log('Seeding sample data for user:', USER_ID);

  // 1. Insert exercise categories
  console.log('Inserting exercise categories...');
  await db.insert(exerciseCategories).values([
    { id: categoryIds.chest, name: 'Chest', description: 'Chest pressing and fly movements' },
    { id: categoryIds.back, name: 'Back', description: 'Pulling movements for back development' },
    { id: categoryIds.legs, name: 'Legs', description: 'Quad, hamstring, and glute exercises' },
    { id: categoryIds.shoulders, name: 'Shoulders', description: 'Overhead pressing and lateral raises' },
    { id: categoryIds.arms, name: 'Arms', description: 'Biceps and triceps isolation work' },
  ]);

  // 2. Insert exercises
  console.log('Inserting exercises...');
  await db.insert(exercises).values([
    { id: exerciseIds.benchPress, userId: USER_ID, categoryId: categoryIds.chest, name: 'Bench Press', description: 'Flat barbell bench press', defaultWeightUnit: 'lbs', isBodyweight: false },
    { id: exerciseIds.inclineDbPress, userId: USER_ID, categoryId: categoryIds.chest, name: 'Incline Dumbbell Press', description: 'Incline DB press at 30 degrees', defaultWeightUnit: 'lbs', isBodyweight: false },
    { id: exerciseIds.barbellRow, userId: USER_ID, categoryId: categoryIds.back, name: 'Barbell Row', description: 'Bent over barbell row', defaultWeightUnit: 'lbs', isBodyweight: false },
    { id: exerciseIds.pullUps, userId: USER_ID, categoryId: categoryIds.back, name: 'Pull-ups', description: 'Bodyweight pull-ups', defaultWeightUnit: 'lbs', isBodyweight: true },
    { id: exerciseIds.squat, userId: USER_ID, categoryId: categoryIds.legs, name: 'Squat', description: 'Barbell back squat', defaultWeightUnit: 'lbs', isBodyweight: false },
    { id: exerciseIds.romanianDeadlift, userId: USER_ID, categoryId: categoryIds.legs, name: 'Romanian Deadlift', description: 'RDL for hamstrings', defaultWeightUnit: 'lbs', isBodyweight: false },
  ]);

  // 3. Insert workouts
  console.log('Inserting workouts...');
  await db.insert(workouts).values([
    { id: workoutIds.pushDay, userId: USER_ID, name: 'Push Day', notes: 'Felt strong today', startedAt: new Date('2026-01-13T09:00:00'), completedAt: new Date('2026-01-13T10:15:00'), durationMinutes: 75 },
    { id: workoutIds.pullDay, userId: USER_ID, name: 'Pull Day', notes: 'Back feeling tight', startedAt: new Date('2026-01-14T18:00:00'), completedAt: new Date('2026-01-14T19:05:00'), durationMinutes: 65 },
    { id: workoutIds.legDay, userId: USER_ID, name: 'Leg Day', notes: 'New squat PR!', startedAt: new Date('2026-01-15T07:30:00'), completedAt: new Date('2026-01-15T08:45:00'), durationMinutes: 75 },
  ]);

  // 4. Insert workout exercises
  console.log('Inserting workout exercises...');
  await db.insert(workoutExercises).values([
    { id: workoutExerciseIds.pushBench, workoutId: workoutIds.pushDay, exerciseId: exerciseIds.benchPress, exerciseOrder: 1, notes: 'Focus on form' },
    { id: workoutExerciseIds.pushIncline, workoutId: workoutIds.pushDay, exerciseId: exerciseIds.inclineDbPress, exerciseOrder: 2, notes: null },
    { id: workoutExerciseIds.pullRow, workoutId: workoutIds.pullDay, exerciseId: exerciseIds.barbellRow, exerciseOrder: 1, notes: 'Keep back flat' },
    { id: workoutExerciseIds.pullPullUps, workoutId: workoutIds.pullDay, exerciseId: exerciseIds.pullUps, exerciseOrder: 2, notes: null },
    { id: workoutExerciseIds.legSquat, workoutId: workoutIds.legDay, exerciseId: exerciseIds.squat, exerciseOrder: 1, notes: 'PR attempt' },
    { id: workoutExerciseIds.legRdl, workoutId: workoutIds.legDay, exerciseId: exerciseIds.romanianDeadlift, exerciseOrder: 2, notes: null },
  ]);

  // 5. Insert sets
  console.log('Inserting sets...');
  await db.insert(sets).values([
    // Bench Press sets (Push Day)
    { id: 'e5f6a7b8-5555-4000-8000-000000000001', workoutExerciseId: workoutExerciseIds.pushBench, setNumber: 1, weight: '135', weightUnit: 'lbs', reps: 10, rpe: '5', isWarmup: true, isDropset: false, notes: 'Warmup' },
    { id: 'e5f6a7b8-5555-4000-8000-000000000002', workoutExerciseId: workoutExerciseIds.pushBench, setNumber: 2, weight: '185', weightUnit: 'lbs', reps: 8, rpe: '7', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000003', workoutExerciseId: workoutExerciseIds.pushBench, setNumber: 3, weight: '205', weightUnit: 'lbs', reps: 6, rpe: '8', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000004', workoutExerciseId: workoutExerciseIds.pushBench, setNumber: 4, weight: '215', weightUnit: 'lbs', reps: 4, rpe: '9', isWarmup: false, isDropset: false, notes: 'Tough!' },

    // Incline DB Press sets (Push Day)
    { id: 'e5f6a7b8-5555-4000-8000-000000000005', workoutExerciseId: workoutExerciseIds.pushIncline, setNumber: 1, weight: '60', weightUnit: 'lbs', reps: 10, rpe: '7', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000006', workoutExerciseId: workoutExerciseIds.pushIncline, setNumber: 2, weight: '65', weightUnit: 'lbs', reps: 8, rpe: '8', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000007', workoutExerciseId: workoutExerciseIds.pushIncline, setNumber: 3, weight: '65', weightUnit: 'lbs', reps: 7, rpe: '9', isWarmup: false, isDropset: false, notes: null },

    // Barbell Row sets (Pull Day)
    { id: 'e5f6a7b8-5555-4000-8000-000000000008', workoutExerciseId: workoutExerciseIds.pullRow, setNumber: 1, weight: '135', weightUnit: 'lbs', reps: 10, rpe: '6', isWarmup: true, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000009', workoutExerciseId: workoutExerciseIds.pullRow, setNumber: 2, weight: '185', weightUnit: 'lbs', reps: 8, rpe: '8', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000010', workoutExerciseId: workoutExerciseIds.pullRow, setNumber: 3, weight: '185', weightUnit: 'lbs', reps: 8, rpe: '8.5', isWarmup: false, isDropset: false, notes: null },

    // Pull-ups sets (Pull Day)
    { id: 'e5f6a7b8-5555-4000-8000-000000000011', workoutExerciseId: workoutExerciseIds.pullPullUps, setNumber: 1, weight: null, weightUnit: null, reps: 12, rpe: '7', isWarmup: false, isDropset: false, notes: 'Bodyweight' },
    { id: 'e5f6a7b8-5555-4000-8000-000000000012', workoutExerciseId: workoutExerciseIds.pullPullUps, setNumber: 2, weight: null, weightUnit: null, reps: 10, rpe: '8', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000013', workoutExerciseId: workoutExerciseIds.pullPullUps, setNumber: 3, weight: null, weightUnit: null, reps: 8, rpe: '9', isWarmup: false, isDropset: false, notes: null },

    // Squat sets (Leg Day)
    { id: 'e5f6a7b8-5555-4000-8000-000000000014', workoutExerciseId: workoutExerciseIds.legSquat, setNumber: 1, weight: '135', weightUnit: 'lbs', reps: 8, rpe: '5', isWarmup: true, isDropset: false, notes: 'Warmup' },
    { id: 'e5f6a7b8-5555-4000-8000-000000000015', workoutExerciseId: workoutExerciseIds.legSquat, setNumber: 2, weight: '225', weightUnit: 'lbs', reps: 5, rpe: '6', isWarmup: true, isDropset: false, notes: 'Warmup' },
    { id: 'e5f6a7b8-5555-4000-8000-000000000016', workoutExerciseId: workoutExerciseIds.legSquat, setNumber: 3, weight: '275', weightUnit: 'lbs', reps: 5, rpe: '8', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000017', workoutExerciseId: workoutExerciseIds.legSquat, setNumber: 4, weight: '295', weightUnit: 'lbs', reps: 3, rpe: '9', isWarmup: false, isDropset: false, notes: 'PR!' },

    // Romanian Deadlift sets (Leg Day)
    { id: 'e5f6a7b8-5555-4000-8000-000000000018', workoutExerciseId: workoutExerciseIds.legRdl, setNumber: 1, weight: '185', weightUnit: 'lbs', reps: 10, rpe: '7', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000019', workoutExerciseId: workoutExerciseIds.legRdl, setNumber: 2, weight: '205', weightUnit: 'lbs', reps: 8, rpe: '8', isWarmup: false, isDropset: false, notes: null },
    { id: 'e5f6a7b8-5555-4000-8000-000000000020', workoutExerciseId: workoutExerciseIds.legRdl, setNumber: 3, weight: '205', weightUnit: 'lbs', reps: 8, rpe: '8.5', isWarmup: false, isDropset: false, notes: null },
  ]);

  console.log('Sample data seeded successfully!');
  console.log('Summary:');
  console.log('- 5 exercise categories');
  console.log('- 6 exercises');
  console.log('- 3 workouts (Push/Pull/Legs)');
  console.log('- 6 workout exercises');
  console.log('- 20 sets');
}

main().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
