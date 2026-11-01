import { Lesson } from '../types';

export const pythonLessons: Lesson[] = [
  // LEVEL 1: BEGINNER
  {
    id: 'py-les-01',
    category: 'python',
    level: 'Beginner',
    topic: 'Introduction & Basics',
    title: 'Introduction to Python & Variables',
    summary: 'Master dynamic typing, naming conventions, and fundamental assignments in Python.',
    content: `### Welcome to Python
Python is a high-level, dynamically typed, interpreted programming language known for its clean readability. In Python, variables are created when you first assign a value to them.

#### Variable Assignment
\`\`\`python
name = "CodeMaster"
rating = 1850
is_active = True
\`\`\`

Python handles memory management automatically using reference counting and a cyclic garbage collector. Every variable holds a reference to an object in memory.`,
    codeExample: `user_name = "Alex"
problems_solved = 42
accuracy_pct = 94.5
is_enrolled = True

print(f"User: {user_name} | Solved: {problems_solved} | Accuracy: {accuracy_pct}%")`,
    expectedOutput: `User: Alex | Solved: 42 | Accuracy: 94.5%`,
    practicalUseCases: [
      'Configuring program runtime states and constants',
      'Storing user input and session tokens',
      'Tracking iterative metrics and scoring parameters'
    ],
    commonMistakes: [
      'Using reserved Python keywords (e.g., class, def, return) as variable names',
      'Confusing dynamic reassignment with static type constraints',
      'Forgetting case-sensitivity (myVar vs myvar)'
    ],
    practiceQuestionIds: ['py-001', 'py-002'],
    quiz: {
      question: 'Which of the following is an invalid variable name in Python?',
      options: ['_total_count', '2nd_player', 'total_score_2', 'userProfile'],
      correctIndex: 1,
      explanation: 'Variable names in Python cannot start with a digit.'
    }
  },
  {
    id: 'py-les-02',
    category: 'python',
    level: 'Beginner',
    topic: 'Control Flow',
    title: 'Conditionals & Logical Branching',
    summary: 'Write resilient branching logic using if, elif, else, and boolean expressions.',
    content: `### Conditional Execution
Branching allows your Python program to evaluate conditions and execute specific code blocks accordingly.

#### Syntax:
\`\`\`python
if condition_1:
    # block 1
elif condition_2:
    # block 2
else:
    # fallback block
\`\`\`

Python relies on indentation (typically 4 spaces) rather than curly braces to define code blocks.`,
    codeExample: `score = 88

if score >= 90:
    grade = "A+"
elif score >= 80:
    grade = "A"
elif score >= 70:
    grade = "B"
else:
    grade = "Needs Practice"

print(f"Grade evaluated: {grade}")`,
    expectedOutput: `Grade evaluated: A`,
    practicalUseCases: [
      'Input validation and sanity checking in web APIs',
      'Conditional sorting and ranking rules',
      'Security permission checks and role-based access'
    ],
    commonMistakes: [
      'Using single equals (=) instead of double equals (==) for comparison',
      'Inconsistent indentation mixing tabs and spaces',
      'Unnecessary nesting when logical operators (and, or) could flatten conditions'
    ],
    practiceQuestionIds: ['py-002', 'py-008'],
    quiz: {
      question: 'What does the expression `bool([])` evaluate to in Python?',
      options: ['True', 'False', 'None', 'TypeError'],
      correctIndex: 1,
      explanation: 'Empty containers like lists, sets, and strings evaluate to False in boolean contexts.'
    }
  },
  {
    id: 'py-les-03',
    category: 'python',
    level: 'Beginner',
    topic: 'Collections',
    title: 'Lists, Tuples & Slicing',
    summary: 'Harness mutable lists, immutable tuples, and high-performance slice syntax.',
    content: `### Sequences in Python
- **List**: An ordered, mutable sequence of arbitrary objects (\`[1, 2, 3]\`).
- **Tuple**: An ordered, immutable sequence (\`(1, 2, 3)\`). Often used as hashable dictionary keys.

#### Slicing: \`sequence[start:stop:step]\`
- Negative indices count backwards from the end (\`-1\` is the last element).
- Reverse a sequence efficiently using \`[::-1]\`.`,
    codeExample: `nums = [10, 20, 30, 40, 50, 60]

print("First 3 elements:", nums[:3])
print("Every 2nd element:", nums[::2])
print("Reversed list:", nums[::-1])`,
    expectedOutput: `First 3 elements: [10, 20, 30]
Every 2nd element: [10, 30, 50]
Reversed list: [60, 50, 40, 30, 20, 10]`,
    practicalUseCases: [
      'Sliding window data processing',
      'Returning multiple atomic values from functions via tuples',
      'Queue and stack simulation buffers'
    ],
    commonMistakes: [
      'Attempting to mutate an immutable tuple (e.g. tup[0] = 5)',
      'Forgetting that slice stop index is exclusive',
      'Shallow copying lists with nested mutable objects'
    ],
    practiceQuestionIds: ['py-071', 'py-074'],
    quiz: {
      question: 'Which operation is NOT valid on a standard Python tuple `t = (1, 2, 3)`?',
      options: ['len(t)', 't.append(4)', 't[0]', '3 in t'],
      correctIndex: 1,
      explanation: 'Tuples are immutable and do not have an .append() method.'
    }
  },
  {
    id: 'py-les-04',
    category: 'python',
    level: 'Beginner',
    topic: 'Hash Structures',
    title: 'Dictionaries & Sets',
    summary: 'Leverage O(1) hash lookups with dictionaries and unique sets.',
    content: `### Dictionaries & Sets
Both Dictionaries and Sets are powered by hash tables under the hood, delivering average $O(1)$ time complexity for lookup, insertion, and deletion.

- **Dictionary**: Key-value mapping (\`{'key': 'value'}\`). Keys must be hashable (immutable).
- **Set**: Collection of unique hashable elements (\`{1, 2, 3}\`).`,
    codeExample: `counts = {"apple": 5, "banana": 2}
counts["orange"] = 7

fruits_set = {"apple", "banana", "pear"}
fruits_set.add("apple")  # Duplicate ignored

print("Counts:", counts)
print("Unique count:", len(fruits_set))`,
    expectedOutput: `Counts: {'apple': 5, 'banana': 2, 'orange': 7}
Unique count: 3`,
    practicalUseCases: [
      'Frequency counting and histograms',
      'Fast membership testing (e.g., seen sets)',
      'Deduplicating elements while preserving unique tokens'
    ],
    commonMistakes: [
      'Using a mutable list as a dictionary key',
      'Accessing dict[missing_key] instead of dict.get(key, default)',
      'Assuming sets preserve insertion order (though dicts do in Python 3.7+)'
    ],
    practiceQuestionIds: ['py-071', 'py-077'],
    quiz: {
      question: 'What is the average time complexity of `item in hash_set` in Python?',
      options: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'],
      correctIndex: 2,
      explanation: 'Set membership testing uses hash table lookups, achieving O(1) average time.'
    }
  },

  // LEVEL 2: INTERMEDIATE
  {
    id: 'py-les-05',
    category: 'python',
    level: 'Intermediate',
    topic: 'Functions & Scope',
    title: 'Functions, *args, **kwargs & Recursion',
    summary: 'Build robust function signatures with variable arguments and master recursion.',
    content: `### Functional Programming in Python
Functions in Python are first-class citizens. They can be passed as arguments, assigned to variables, and returned from other functions.

#### Variable Arguments:
- \`*args\`: Collects positional arguments into a tuple.
- \`**kwargs\`: Collects keyword arguments into a dictionary.`,
    codeExample: `def summarize(title, *scores, **metadata):
    total = sum(scores)
    avg = total / len(scores) if scores else 0
    print(f"{title}: Total={total}, Avg={avg:.1f}")
    if metadata:
        print("Meta:", metadata)

summarize("Midterm Exam", 85, 92, 78, semester="Fall", year=2026)`,
    expectedOutput: `Midterm Exam: Total=255, Avg=85.0
Meta: {'semester': 'Fall', 'year': 2026}`,
    practicalUseCases: [
      'Building flexible wrapper functions and decorators',
      'Recursive divide-and-conquer algorithms (Merge sort, Tree traversals)',
      'Designing extensible public API libraries'
    ],
    commonMistakes: [
      'Missing base condition in recursive functions resulting in RecursionError',
      'Passing keyword arguments before positional arguments',
      'Rebinding variables inside inner functions without nonlocal or global'
    ],
    practiceQuestionIds: ['py-151', 'py-153'],
    quiz: {
      question: 'What type is `args` inside a function defined as `def func(*args): pass`?',
      options: ['list', 'tuple', 'set', 'dict'],
      correctIndex: 1,
      explanation: 'Positional arguments captured by *args are bundled into an immutable tuple.'
    }
  },
  {
    id: 'py-les-06',
    category: 'python',
    level: 'Intermediate',
    topic: 'Object-Oriented Programming',
    title: 'Classes, Inheritance & Dunder Methods',
    summary: 'Design clean domain models using classes, polymorphism, and dunder magic methods.',
    content: `### Classes and Objects
Python's object-oriented system is based on explicit \`self\` references and special double-underscore ("dunder") methods.

#### Key Dunder Methods:
- \`__init__(self, ...)\`: Constructor initialization.
- \`__str__(self)\`: User-readable string representation.
- \`__repr__(self)\`: Developer/debugging representation.
- \`__eq__(self, other)\`: Equality comparison override.`,
    codeExample: `class Candidate:
    def __init__(self, name: str, xp: int):
        self.name = name
        self.xp = xp
        
    def add_xp(self, amount: int):
        self.xp += amount
        
    def __repr__(self):
        return f"Candidate(name='{self.name}', xp={self.xp})"

c = Candidate("Sakshi", 500)
c.add_xp(250)
print(c)`,
    expectedOutput: `Candidate(name='Sakshi', xp=750)`,
    practicalUseCases: [
      'Domain driven business entity modeling',
      'Encapsulating stateful data structures like Stacks, Queues, and Graphs',
      'Custom exceptions and data wrappers'
    ],
    commonMistakes: [
      'Forgetting self as the first parameter of instance methods',
      'Accidentally sharing class variables among all instances when instance variables were intended',
      'Over-engineering with deep inheritance hierarchies instead of composition'
    ],
    practiceQuestionIds: ['py-151', 'py-154'],
    quiz: {
      question: 'How do you call the parent class method from an overridden child class method?',
      options: ['parent.method()', 'super().method()', 'base(method)', 'this.parent()'],
      correctIndex: 1,
      explanation: 'super() delegates method calls to the parent or next class in the Method Resolution Order (MRO).'
    }
  },

  // LEVEL 3: ADVANCED
  {
    id: 'py-les-07',
    category: 'python',
    level: 'Advanced',
    topic: 'Advanced Idioms',
    title: 'Decorators, Closures & Context Managers',
    summary: 'Write metaprogramming wrappers, timing decorators, and custom context managers.',
    content: `### Decorators & Metaprogramming
A decorator is a callable that takes another function as input, extends its behavior without modifying it directly, and returns a callable.

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        # Do something before
        result = func(*args, **kwargs)
        # Do something after
        return result
    return wrapper
\`\`\`

#### Context Managers:
Implemented using the \`__enter__\` and \`__exit__\` protocol, ensuring guaranteed resource cleanup even if exceptions are thrown.`,
    codeExample: `import time

def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        res = func(*args, **kwargs)
        duration = (time.perf_counter() - start) * 1000
        print(f"[{func.__name__}] executed in {duration:.3f}ms")
        return res
    return wrapper

@timing_decorator
def compute_sum(n):
    return sum(range(n))

print("Result:", compute_sum(100000))`,
    expectedOutput: `[compute_sum] executed in 1.450ms
Result: 4999950000`,
    practicalUseCases: [
      'API rate limiting, authentication gates, and logging',
      'Database connection pooling and automatic rollback/commit',
      'Memoization and caching (e.g. functools.lru_cache)'
    ],
    commonMistakes: [
      'Forgetting to return the function result from the decorator wrapper',
      'Losing original function metadata (fix by using @functools.wraps)',
      'Not returning True in __exit__ when intentionally suppressing an handled exception'
    ],
    practiceQuestionIds: ['py-221', 'py-222'],
    quiz: {
      question: 'Which tool from functools is standardly used to preserve function name and docstring inside a decorator?',
      options: ['@functools.lru_cache', '@functools.wraps', '@functools.partial', '@functools.singledispatch'],
      correctIndex: 1,
      explanation: '@functools.wraps copies the original function’s __name__, __doc__, and annotations to the wrapper.'
    }
  }
];

export const dsaLessons: Lesson[] = [
  {
    id: 'dsa-les-01',
    category: 'dsa',
    level: 'Beginner',
    topic: 'Arrays & Two Pointers',
    title: 'Mastering Array Invariants & Two Pointers',
    summary: 'Learn when and how to collapse O(N^2) searches into O(N) linear scans using two pointers.',
    content: `### Two Pointers Technique
Two Pointers is an algorithmic pattern where two pointers navigate a sequence (typically an array or string) either in opposing directions or in tandem.

#### Common Scenarios:
1. **Opposite Ends**: Left at 0, Right at N-1 (e.g. Palindrome verification, Pair Sum in sorted arrays, Container with Most Water).
2. **Fast & Slow**: One pointer advances faster than the other (e.g. Cycle detection in linked lists, removing duplicates in-place).`,
    codeExample: `def two_sum_sorted(nums: list[int], target: int) -> list[int]:
    left, right = 0, len(nums) - 1
    while left < right:
        curr = nums[left] + nums[right]
        if curr == target:
            return [left, right]
        elif curr < target:
            left += 1
        else:
            right -= 1
    return []

print("Indices:", two_sum_sorted([1, 2, 4, 6, 8, 11], 10))`,
    expectedOutput: `Indices: [1, 4]`,
    practicalUseCases: [
      'Reversing strings or arrays in-place with O(1) auxiliary space',
      'Partitioning arrays in QuickSort and Dutch National Flag',
      'Trapping rainwater calculations'
    ],
    commonMistakes: [
      'Applying two-pointer sorted pair-sum on unsorted arrays without sorting first',
      'Off-by-one pointer increments causing missed optimal pairs',
      'Failing to stop when left >= right in bounded intervals'
    ],
    practiceQuestionIds: ['dsa-001', 'dsa-161'],
    quiz: {
      question: 'What is the prerequisites for using opposing two-pointers for the Two Sum problem in O(N)?',
      options: ['The array must be sorted', 'The array must only have positive numbers', 'The array size must be even', 'The array must not contain duplicates'],
      correctIndex: 0,
      explanation: 'Opposing two pointers relies on sorted monotonicity to decide whether to increment left or decrement right.'
    }
  },
  {
    id: 'dsa-les-02',
    category: 'dsa',
    level: 'Intermediate',
    topic: 'Trees & Graphs',
    title: 'Binary Tree Traversals & BST Invariants',
    summary: 'Understand Depth-First Search (Pre/In/Post) and Breadth-First Search (Level Order).',
    content: `### Tree Traversals
Trees are hierarchical recursive structures. In a Binary Search Tree (BST), every node satisfies:
\`node.left.val < node.val < node.right.val\`.

#### Traversal Types:
- **In-Order (Left, Root, Right)**: Visits BST nodes in strictly sorted ascending order.
- **Pre-Order (Root, Left, Right)**: Ideal for copying or serializing trees.
- **Post-Order (Left, Right, Root)**: Ideal for bottom-up calculations (e.g., node height, tree deletion).
- **Level-Order (BFS)**: Uses a Queue to traverse level-by-level.`,
    codeExample: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, TreeNode(5), TreeNode(7)))

def inorder(node):
    return inorder(node.left) + [node.val] + inorder(node.right) if node else []

print("BST In-Order traversal:", inorder(root))`,
    expectedOutput: `BST In-Order traversal: [1, 2, 3, 4, 5, 6, 7]`,
    practicalUseCases: [
      'Database indexing (B-Trees and Red-Black Trees)',
      'DOM tree manipulation and compiler AST parsing',
      'Hierarchical file system explorers'
    ],
    commonMistakes: [
      'Validating BST by only checking immediate children instead of entire subtree min/max bounds',
      'Stack overflow in unbalanced trees with linear recursion depth',
      'Forgetting null checks on leaf node left/right pointers'
    ],
    practiceQuestionIds: ['dsa-346', 'dsa-347'],
    quiz: {
      question: 'Which traversal of a Binary Search Tree yields values in strictly non-decreasing sorted order?',
      options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
      correctIndex: 1,
      explanation: 'In-order traversal visits left subtree, root, then right subtree, which matches the BST property.'
    }
  },
  {
    id: 'dsa-les-03',
    category: 'dsa',
    level: 'Advanced',
    topic: 'Dynamic Programming',
    title: 'Dynamic Programming: Memoization & Tabulation',
    summary: 'Deconstruct complex optimization problems into optimal substructure and overlapping subproblems.',
    content: `### The Core of Dynamic Programming
Dynamic Programming solves optimization problems by breaking them into overlapping subproblems and caching intermediate results.

#### Two Key Strategies:
1. **Top-Down with Memoization**: Start at original problem, recursively solve smaller subproblems, and cache results in a hash map or array.
2. **Bottom-Up with Tabulation**: Start from base cases and iteratively populate a DP table up to the target state. Space optimization is often possible by keeping only the last few rows/values.`,
    codeExample: `def climb_stairs(n: int) -> int:
    # Base cases: 1 step -> 1 way, 2 steps -> 2 ways
    if n <= 2: return n
    prev, curr = 1, 2
    for _ in range(3, n + 1):
        prev, curr = curr, prev + curr
    return curr

print("Ways to climb 6 steps:", climb_stairs(6))`,
    expectedOutput: `Ways to climb 6 steps: 13`,
    practicalUseCases: [
      'Resource allocation and knapsack optimization',
      'Diff algorithms (Longest Common Subsequence / Edit Distance)',
      'Shortest path algorithms in graphs with negative weights (Bellman-Ford, Floyd-Warshall)'
    ],
    commonMistakes: [
      'Attempting DP when optimal substructure does not hold',
      'Failing to initialize base cases properly in the DP array',
      'Using 2D tables when space can be compressed to 1D'
    ],
    practiceQuestionIds: ['dsa-506', 'dsa-508'],
    quiz: {
      question: 'What are the two mandatory properties a problem must possess for Dynamic Programming to apply?',
      options: [
        'Optimal substructure and overlapping subproblems',
        'Greedy choice property and sorted inputs',
        'Balanced trees and log-time searches',
        'Deterministic state and finite memory'
      ],
      correctIndex: 0,
      explanation: 'A problem must have optimal substructure (optimal solution composed of optimal subsolutions) and overlapping subproblems (same subproblems solved repeatedly).'
    }
  }
];
