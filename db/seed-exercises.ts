import 'dotenv/config';
import { db } from './index';
import { exerciseCategories, exercises } from './schema';

async function seedExercises() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ========================================
    // 1. SEED EXERCISE CATEGORIES
    // ========================================
    console.log('📦 Seeding exercise categories...');

    const categories = await db
      .insert(exerciseCategories)
      .values([
        {
          name: 'Chest',
          description: 'Chest and pectoral exercises',
        },
        {
          name: 'Back',
          description: 'Back, lats, and rear deltoid exercises',
        },
        {
          name: 'Legs',
          description: 'Quadriceps, hamstrings, glutes, and calf exercises',
        },
        {
          name: 'Shoulders',
          description: 'Deltoid and shoulder exercises',
        },
        {
          name: 'Arms',
          description: 'Biceps, triceps, and forearm exercises',
        },
        {
          name: 'Core',
          description: 'Abdominal and core stability exercises',
        },
        {
          name: 'Cardio',
          description: 'Cardiovascular and conditioning exercises',
        },
        {
          name: 'Full Body',
          description: 'Compound movements involving multiple muscle groups',
        },
      ])
      .returning();

    console.log(`✅ Created ${categories.length} categories\n`);

    // Create category lookup map
    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      },
      {} as Record<string, string>
    );

    // ========================================
    // 2. SEED GLOBAL EXERCISES
    // ========================================
    console.log('💪 Seeding common exercises...');

    const commonExercises = [
      // CHEST EXERCISES
      {
        name: 'Barbell Bench Press',
        categoryId: categoryMap['Chest'],
        description: 'Classic compound chest exercise using a barbell on a flat bench',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Dumbbell Bench Press',
        categoryId: categoryMap['Chest'],
        description: 'Bench press using dumbbells for greater range of motion',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Incline Barbell Bench Press',
        categoryId: categoryMap['Chest'],
        description: 'Bench press on an incline bench targeting upper chest',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Push-ups',
        categoryId: categoryMap['Chest'],
        description: 'Classic bodyweight chest exercise',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Dumbbell Flyes',
        categoryId: categoryMap['Chest'],
        description: 'Isolation exercise for chest using dumbbells',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },

      // BACK EXERCISES
      {
        name: 'Barbell Deadlift',
        categoryId: categoryMap['Back'],
        description: 'Compound exercise targeting back, glutes, and hamstrings',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Pull-ups',
        categoryId: categoryMap['Back'],
        description: 'Bodyweight exercise targeting lats and upper back',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Barbell Rows',
        categoryId: categoryMap['Back'],
        description: 'Bent-over row using a barbell',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Lat Pulldown',
        categoryId: categoryMap['Back'],
        description: 'Cable exercise targeting latissimus dorsi',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Dumbbell Rows',
        categoryId: categoryMap['Back'],
        description: 'Single-arm row using dumbbells',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },

      // LEG EXERCISES
      {
        name: 'Barbell Squat',
        categoryId: categoryMap['Legs'],
        description: 'Compound leg exercise using a barbell',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Leg Press',
        categoryId: categoryMap['Legs'],
        description: 'Machine-based leg exercise',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Romanian Deadlift',
        categoryId: categoryMap['Legs'],
        description: 'Hamstring-focused deadlift variation',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Leg Curl',
        categoryId: categoryMap['Legs'],
        description: 'Isolation exercise for hamstrings',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Leg Extension',
        categoryId: categoryMap['Legs'],
        description: 'Isolation exercise for quadriceps',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Calf Raises',
        categoryId: categoryMap['Legs'],
        description: 'Exercise targeting calf muscles',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Lunges',
        categoryId: categoryMap['Legs'],
        description: 'Unilateral leg exercise',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },

      // SHOULDER EXERCISES
      {
        name: 'Overhead Press',
        categoryId: categoryMap['Shoulders'],
        description: 'Standing barbell shoulder press',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Dumbbell Shoulder Press',
        categoryId: categoryMap['Shoulders'],
        description: 'Seated or standing shoulder press with dumbbells',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Lateral Raises',
        categoryId: categoryMap['Shoulders'],
        description: 'Isolation exercise for side deltoids',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Front Raises',
        categoryId: categoryMap['Shoulders'],
        description: 'Isolation exercise for front deltoids',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Face Pulls',
        categoryId: categoryMap['Shoulders'],
        description: 'Cable exercise for rear deltoids and upper back',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },

      // ARM EXERCISES
      {
        name: 'Barbell Curl',
        categoryId: categoryMap['Arms'],
        description: 'Classic bicep curl with barbell',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Dumbbell Curl',
        categoryId: categoryMap['Arms'],
        description: 'Bicep curl using dumbbells',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Hammer Curl',
        categoryId: categoryMap['Arms'],
        description: 'Neutral grip bicep curl targeting brachialis',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Tricep Dips',
        categoryId: categoryMap['Arms'],
        description: 'Bodyweight tricep exercise',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Tricep Pushdown',
        categoryId: categoryMap['Arms'],
        description: 'Cable exercise for triceps',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Skull Crushers',
        categoryId: categoryMap['Arms'],
        description: 'Lying tricep extension',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },

      // CORE EXERCISES
      {
        name: 'Plank',
        categoryId: categoryMap['Core'],
        description: 'Isometric core exercise (track duration)',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Crunches',
        categoryId: categoryMap['Core'],
        description: 'Basic abdominal exercise',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Hanging Leg Raises',
        categoryId: categoryMap['Core'],
        description: 'Advanced core exercise hanging from bar',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Russian Twists',
        categoryId: categoryMap['Core'],
        description: 'Rotational core exercise',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Ab Wheel Rollout',
        categoryId: categoryMap['Core'],
        description: 'Advanced core exercise using ab wheel',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },

      // CARDIO EXERCISES
      {
        name: 'Treadmill Running',
        categoryId: categoryMap['Cardio'],
        description: 'Running on treadmill (track distance and duration)',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Stationary Bike',
        categoryId: categoryMap['Cardio'],
        description: 'Cycling on stationary bike (track distance and duration)',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Rowing Machine',
        categoryId: categoryMap['Cardio'],
        description: 'Rowing exercise (track distance and duration)',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Jump Rope',
        categoryId: categoryMap['Cardio'],
        description: 'Skipping rope exercise (track duration or reps)',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },

      // FULL BODY EXERCISES
      {
        name: 'Burpees',
        categoryId: categoryMap['Full Body'],
        description: 'Full body conditioning exercise',
        defaultWeightUnit: 'lbs',
        isBodyweight: true,
      },
      {
        name: 'Kettlebell Swings',
        categoryId: categoryMap['Full Body'],
        description: 'Explosive hip hinge movement with kettlebell',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
      {
        name: 'Clean and Press',
        categoryId: categoryMap['Full Body'],
        description: 'Compound Olympic lift variation',
        defaultWeightUnit: 'lbs',
        isBodyweight: false,
      },
    ];

    const insertedExercises = await db
      .insert(exercises)
      .values(
        commonExercises.map((ex) => ({
          ...ex,
          userId: null, // null = global exercise available to all users
        }))
      )
      .returning();

    console.log(`✅ Created ${insertedExercises.length} exercises\n`);

    // ========================================
    // 3. SUMMARY
    // ========================================
    console.log('✨ Seed complete!\n');
    console.log('Summary:');
    console.log(`  - ${categories.length} categories`);
    console.log(`  - ${insertedExercises.length} global exercises`);
    console.log('\nYou can now:');
    console.log('  1. Start creating workouts');
    console.log('  2. Add custom exercises (user-specific)');
    console.log('  3. Log sets and track progress\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedExercises()
  .then(() => {
    console.log('✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
