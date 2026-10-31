import type { GameData } from '../types/game';

/**
 * Built-in Demo Mode dataset. Lets Black Mask be played instantly with zero API keys.
 * Theme: "The Architecture of Artificial Neural Networks & Preventing AI Cognitive Atrophy".
 */
export const FALLBACK_GAME_DATA: GameData = {
  documentTitle:
    'The Architecture of Artificial Neural Networks & Preventing AI Cognitive Atrophy',
  storyIntro:
    'One bad night later, you wake in Roman Sionis\u2019s private study above the Black Mask Club. The doors are sealed, the overheads are dying, and the gargoyle gate only answers to proof. Six locks hold six Syndicate Keys \u2014 every one of them cut from the chapter you were supposed to actually read. Show Black Mask you learned it, or the only way out is in a body bag.',
  puzzles: {
    bookshelf: {
      pairs: [
        {
          term: 'Perceptron',
          definition:
            'The simplest neural unit: it multiplies inputs by weights, adds a bias, and fires through an activation function.',
        },
        {
          term: 'Backpropagation',
          definition:
            'The algorithm that pushes error backwards through the network using the chain rule to compute each weight\u2019s gradient.',
        },
        {
          term: 'Activation Function',
          definition:
            'A non-linear transform such as ReLU or sigmoid that lets a network model relationships a straight line never could.',
        },
        {
          term: 'Cognitive Atrophy',
          definition:
            'The measurable decay of a person\u2019s own recall and reasoning after routinely outsourcing thinking to an AI assistant.',
        },
      ],
    },
    clock: {
      prompt:
        'Someone scrambled one full training iteration of a neural network. Restore the true order of the cycle before the vault locks.',
      orderedSteps: [
        'Forward pass: inputs flow layer by layer through weights and activations to produce a prediction.',
        'Loss computation: the prediction is compared against the ground-truth label to produce an error value.',
        'Backward pass: backpropagation applies the chain rule to compute the gradient of the loss for every weight.',
        'Weight update: the optimiser (such as SGD or Adam) nudges each weight down its gradient by the learning rate.',
      ],
    },
    scale: {
      statements: [
        {
          text: 'Stacking many linear layers without activation functions is mathematically equivalent to one single linear layer.',
          isTrue: true,
          explanation:
            'A composition of linear maps is still linear. Without a non-linearity between layers, depth buys you no extra expressive power at all.',
        },
        {
          text: 'A model that reaches near-zero training loss is guaranteed to perform well on unseen data.',
          isTrue: false,
          explanation:
            'That is the classic overfitting trap. Near-zero training loss often means the network memorised noise; only validation and test performance reveal true generalisation.',
        },
        {
          text: 'Dropout fights overfitting by randomly deactivating a fraction of neurons during each training step.',
          isTrue: true,
          explanation:
            'Dropout forces the network to spread knowledge across redundant pathways instead of leaning on a few brittle neurons.',
        },
        {
          text: 'Reading an AI-generated summary produces the same long-term retention as retrieving the material from memory yourself.',
          isTrue: false,
          explanation:
            'Passive reading feels fluent but builds weak traces. Active retrieval \u2014 testing yourself before you check \u2014 is what actually consolidates memory, which is exactly why this escape room exists.',
        },
      ],
    },
    safe: {
      questions: [
        {
          q: 'Which problem does the ReLU activation most directly mitigate compared with the sigmoid?',
          options: [
            'Exploding batch sizes',
            'The vanishing gradient problem in deep networks',
            'Insufficient training data',
            'Slow disk input/output',
          ],
          correctIndex: 1,
        },
        {
          q: 'What does the learning rate hyperparameter actually control?',
          options: [
            'The size of each step taken along the gradient during a weight update',
            'How many layers the network contains',
            'The number of training examples per epoch',
            'The percentage of neurons dropped out',
          ],
          correctIndex: 0,
        },
        {
          q: 'Why is a validation set held out separately from the training set?',
          options: [
            'To speed up matrix multiplication',
            'To give the optimiser extra gradients',
            'To measure generalisation and tune hyperparameters without contaminating the final test',
            'To increase the total parameter count',
          ],
          correctIndex: 2,
        },
        {
          q: 'According to the chapter, which study habit best protects against AI-driven cognitive atrophy?',
          options: [
            'Asking the model to summarise every chapter for you',
            'Re-reading highlighted passages repeatedly',
            'Listening to lectures at double speed',
            'Attempting recall and problem-solving yourself first, then using AI to check and critique your answer',
          ],
          correctIndex: 3,
        },
      ],
    },
    cauldron: {
      clue: 'The optimiser descends the error surface by following the negative [BLANK] of the loss with respect to each weight.',
      answer: 'gradient',
      hint: 'It is the vector of partial derivatives \u2014 the direction of steepest increase, which we deliberately walk against.',
    },
    gargoyle: {
      scenario:
        'Your network hits 99.4% accuracy on the training set but only 71% on the validation set, and the gap widens with every epoch. The gate\u2019s warden demands the single most appropriate next move \u2014 and warns that guessing costs blood.',
      options: [
        'Add more layers and parameters so the model can fit the validation set too',
        'Apply regularisation (dropout, weight decay, early stopping) and gather or augment more training data',
        'Raise the learning rate sharply so training escapes the current minimum',
        'Train for many more epochs until validation accuracy eventually catches up',
      ],
      correctIndex: 1,
      explanation:
        'A large and growing train/validation gap is textbook overfitting. Increasing capacity or training longer makes it worse; the cure is regularisation plus more or better-augmented data. The same principle governs your own study habits: a brain that only memorises the exact worked example has overfit, while one that practises varied retrieval generalises.',
    },
  },
};
